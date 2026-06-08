"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ChevronRight, Upload, Settings, BarChart3 } from "lucide-react"

const onboardingSteps = [
  {
    title: "Connect your first data file",
    description: "Upload Excel, CSV, or Google Sheets data to build your first report.",
    icon: Upload,
    cta: "Go to Upload",
    href: "/upload",
  },
  {
    title: "Review data validation",
    description: "Fix missing costs, suppliers, and weak fields before relying on recommendations.",
    icon: CheckCircle2,
    cta: "Open Validation",
    href: "/data-validation",
  },
  {
    title: "Set your account preferences",
    description: "Confirm your plan and billing settings so your workspace is ready.",
    icon: Settings,
    cta: "Open Settings",
    href: "/settings",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)

  const completeOnboarding = async () => {
    setCompleting(true)

    try {
      const response = await fetch("/api/auth/onboarding/complete", { method: "POST" })
      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setCompleting(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setCompleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Business Health Reporter</h1>
        <p className="mt-2 text-muted-foreground">
          Let’s complete a quick setup so your dashboard stays simple and accurate.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {onboardingSteps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <step.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push(step.href)}>
                {step.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Finish onboarding
          </CardTitle>
          <CardDescription>
            Click below once you’ve reviewed upload, validation, and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={completeOnboarding} disabled={completing} className="gap-2">
            {completing ? "Finishing..." : "Complete setup"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
