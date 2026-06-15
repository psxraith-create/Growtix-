import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  return NextResponse.json({ error: "Database not configured" }, { status: 500 });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const signatureBuffer = Buffer.from(razorpay_signature, "hex");

    let isSignatureValid = false;
    if (expectedBuffer.length === signatureBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan_status: "active",
        plan_expires_at: null,
      })
      .eq("razorpay_subscription_id", razorpay_subscription_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
