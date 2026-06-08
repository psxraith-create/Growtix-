import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Query profiles for razorpay_subscription_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("razorpay_subscription_id")
      .eq("email", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const subscriptionId = profile.razorpay_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    // Call Razorpay API: POST https://api.razorpay.com/v1/subscriptions/{id}/cancel with { cancel_at_cycle_end: 1 }
    const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Razorpay cancel error:", errorData);
      return NextResponse.json({ error: "Failed to cancel subscription from provider" }, { status: response.status });
    }

    // Update profiles: plan_status='canceled'
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ plan_status: "canceled" })
      .eq("email", userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
