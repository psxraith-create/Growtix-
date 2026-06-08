import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, contact } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, razorpay_customer_id")
      .eq("email", email)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    let customerId = profile?.razorpay_customer_id;
    let actualUserId = profile?.id;

    // If missing, create Razorpay customer and save to profiles
    if (!customerId) {
      const customer = await razorpay.customers.create({
        email,
        contact: contact || undefined,
        notes: { email },
      });
      customerId = customer.id;

      if (!actualUserId) {
         // Create a new profile if it doesn't exist
         const { data: newProfile, error: insertError } = await supabase
           .from("profiles")
           .insert({
             email: email,
             razorpay_customer_id: customerId,
           })
           .select("id")
           .single();
         if (insertError) throw insertError;
         actualUserId = newProfile.id;
      } else {
         const { error: updateError } = await supabase
           .from("profiles")
           .update({
             razorpay_customer_id: customerId,
           })
           .eq("id", actualUserId);
         if (updateError) throw updateError;
      }
    }

    // Call razorpay.subscriptions.create
    const subscription: any = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!,
      customer_id: customerId,
      total_count: 12,
      customer_notify: 1,
      notes: { actualUserId },
    } as any);

    // Save subscription.id to profiles, set plan_status='pending'
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        razorpay_subscription_id: subscription.id,
        plan_status: "pending",
      })
      .eq("id", actualUserId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
