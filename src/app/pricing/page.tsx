"use client";

import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    key: "starter",
    price: "$19",
    description: "Great for small shops getting started.",
    features: ["1 business workspace", "CSV/Excel uploads", "Basic health score report"],
  },
  {
    name: "Growth",
    key: "growth",
    price: "$49",
    description: "Best for growing teams and multiple suppliers.",
    features: ["3 workspaces", "Supplier + product deep views", "Priority validation insights"],
    recommended: true,
  },
  {
    name: "Scale",
    key: "scale",
    price: "$99",
    description: "For multi-location operations and advanced planning.",
    features: ["Unlimited workspaces", "Advanced investment planning", "Dedicated onboarding support"],
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planKey: string) => {
    setLoadingPlan(planKey);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Are you online?");
        setLoadingPlan(null);
        return;
      }

      // Fetch current session
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.ok || !sessionData.session) {
        // Not logged in, go to signup
        router.push(`/signup?plan=${planKey}`);
        return;
      }

      const email = sessionData.session.email;

      // Create subscription
      const subRes = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: email }), // Fallback userId to email
      });

      const subData = await subRes.json();

      if (!subRes.ok) {
        alert(subData.error || "Failed to create subscription");
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: subData.keyId,
        subscription_id: subData.subscriptionId,
        name: "Business Health Reporter",
        description: "Pro Plan",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                userId: email,
              }),
            });

            if (verifyRes.ok) {
              router.push("/dashboard?upgraded=true");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (e) {
            alert("Error verifying payment.");
          }
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Simple pricing for small businesses</h1>
        <p className="mt-2 text-muted-foreground">
          Start small and upgrade when you need more locations, suppliers, or users.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.key} className={plan.recommended ? "border-primary shadow-sm" : ""}>
            <CardHeader>
              {plan.recommended ? <Badge className="w-fit">Most popular</Badge> : null}
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.key === "starter" ? (
                <Button onClick={() => router.push(`/signup?plan=${plan.key}`)} className="w-full" variant="outline">
                  Choose {plan.name}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loadingPlan === plan.key}
                >
                  {loadingPlan === plan.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Choose {plan.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
