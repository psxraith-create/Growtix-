"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlanTier } from "@/lib/auth-session"

type SessionPayload = {
  fullName: string
  email: string
  plan: PlanTier
}

export default function SettingsPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [fullName, setFullName] = useState("")
  const [plan, setPlan] = useState<PlanTier>("starter")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/auth/session")
      const payload = await response.json()

      if (response.ok && payload.ok && payload.session) {
        setSession(payload.session)
        setFullName(payload.session.fullName)
        setPlan(payload.session.plan)
      }
    }

    loadSession()
  }, [])

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, plan }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Unable to save settings")
        return
      }

      setSession(payload.session)
      setMessage("Settings saved")
      router.refresh()
    } catch {
      setMessage("Unexpected network error")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      <p className="mt-2 text-muted-foreground">Manage your profile, plan, and workspace preferences.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update how your account appears in the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
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

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/settings/billing")}>
                Manage billing
              </Button>
              <Button type="button" variant="ghost" onClick={signOut}>
                Sign out
              </Button>
            </div>

            {message ? (
              <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
