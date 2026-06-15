import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { sendPaymentFailedEmail, sendSubscriptionCancelledEmail } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  return NextResponse.json({ error: "Database not configured" }, { status: 500 });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserBySubscriptionId(subscriptionId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("razorpay_subscription_id", subscriptionId)
    .single();
  
  if (error) {
    console.error("Error fetching user by subscription ID:", error);
    return null;
  }
  
  return data;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    let isSignatureValid = false;
    if (expectedBuffer.length === signatureBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    let subscriptionId = body.payload?.subscription?.entity?.id;
    
    // In case of payment.failed, the subscription entity might not be the primary payload
    if (!subscriptionId && event === "payment.failed") {
      subscriptionId = body.payload?.payment?.entity?.subscription_id;
    }

    if (!subscriptionId) {
      // If we cannot find a subscription ID, just acknowledge receipt
      return NextResponse.json({ received: true }, { status: 200 });
    }

    let updateData: any = null;

    switch (event) {
      case "subscription.activated":
      case "subscription.charged":
        updateData = {
          plan_status: "active",
          plan_expires_at: null,
        };
        break;
      case "subscription.halted":
      case "payment.failed":
        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + 3);
        updateData = {
          plan_status: "past_due",
          grace_period_ends_at: graceEnd.toISOString(),
        };
        
        // Send payment failed email
        const user = await getUserBySubscriptionId(subscriptionId);
        if (user && user.email) {
          await sendPaymentFailedEmail(user.email, subscriptionId);
        }
        break;
      case "subscription.cancelled":
        const currentPeriodEnd = body.payload.subscription.entity.current_period_end;
        updateData = {
          plan_status: "canceled",
          plan_expires_at: currentPeriodEnd 
            ? new Date(currentPeriodEnd * 1000).toISOString() 
            : null,
        };
        
        // Send subscription cancelled email
        const userCancelled = await getUserBySubscriptionId(subscriptionId);
        if (userCancelled && userCancelled.email) {
          await sendSubscriptionCancelledEmail(userCancelled.email, subscriptionId);
        }
        break;
    }

    if (updateData) {
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("razorpay_subscription_id", subscriptionId);

      if (error) {
        console.error("Webhook Supabase update error:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
