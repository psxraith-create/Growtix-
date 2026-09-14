"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlanTier } from "@/lib/auth-session"

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = (searchParams.get("plan") as PlanTier | null) ?? "starter"

  const [fullName, setFullName] = useState("Jane Owner")
  const [email, setEmail] = useState("owner@demo.com")
  const [password, setPassword] = useState("demo123")
  const [plan, setPlan] = useState<PlanTier>(initialPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, plan }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Unable to create account")
        return
      }

      router.push("/onboarding")
      router.refresh()
    } catch {
      setError("Unexpected error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Set up your workspace and start your first health report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Starting plan</Label>
              <select
                id="plan"
                value={plan}
                onChange={(event) => setPlan(event.target.value as PlanTier)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
              </select>
            </div>

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}