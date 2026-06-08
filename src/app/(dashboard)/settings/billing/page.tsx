"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()

        if (sessionData.ok && sessionData.session) {
          setEmail(sessionData.session.email)
        }

        const statusRes = await fetch("/api/billing/status")
        const statusData = await statusRes.json()

        if (statusRes.ok) {
          setStatus(statusData.plan_status)
        }
      } catch (error) {
        console.error("Failed to load billing data", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCancel = async () => {
    if (!email) return
    setCanceling(true)
    setMessage(null)

    try {
      const res = await fetch("/api/razorpay/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email }),
      })
      
      if (!res.ok) {
        throw new Error("Failed to cancel")
      }
      
      setMessage("Your plan will end at the current billing period")
      setStatus("canceled")
    } catch (error) {
      setMessage("Error canceling subscription")
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading billing info...</div>
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
      <p className="mt-2 text-muted-foreground">Manage your subscription and payment settings.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Plan Status</CardTitle>
          <CardDescription>
            Your subscription status is: <strong>{status || "free"}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "active" && (
            <Button variant="destructive" onClick={handleCancel} disabled={canceling}>
              {canceling ? "Canceling..." : "Cancel Subscription"}
            </Button>
          )}

          {status === "canceled" && (
            <Link href="/pricing" passHref>
              <Button>Resubscribe</Button>
            </Link>
          )}

          {status === "past_due" && (
            <div>
              <p className="text-red-600 mb-2 font-medium">Payment failed — update payment method</p>
              <Link href="/pricing" passHref>
                <Button variant="outline">Update Payment Method</Button>
              </Link>
            </div>
          )}

          {(!status || status === "free" || status === "pending") && (
            <Link href="/pricing" passHref>
              <Button>View Plans</Button>
            </Link>
          )}

          {message && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 mt-4 inline-block">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
