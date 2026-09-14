import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getReportForUI } from "@/lib/live-report"
import { getServerAuthSession } from "@/lib/auth-session"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  TrendingUp,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage({ searchParams }: { searchParams: { upgraded?: string } }) {
  const { report, source } = await getReportForUI()

  let isPastDue = false
  let daysLeft = 0

  // Check for a past-due plan via the custom auth cookie (optional; never crashes on missing Supabase env).
  const session = await getServerAuthSession()

  if (session?.email) {
    try {
      const supabase = getSupabaseAdminClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_status, grace_period_ends_at")
        .eq("email", session.email)
        .single()

      if (profile?.plan_status === "past_due" && profile?.grace_period_ends_at) {
        isPastDue = true
        const diffTime = new Date(profile.grace_period_ends_at).getTime() - new Date().getTime()
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      }
    } catch (error) {
      console.error("Dashboard profile check skipped:", error)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {isPastDue && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold">Payment Failed</h3>
            <p className="text-sm text-red-800">Your payment failed. Please update your payment method within {daysLeft} days to keep access.</p>
          </div>
        </div>
      )}
      {searchParams.upgraded === "true" && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-semibold">Plan Upgraded Successfully</h3>
            <p className="text-sm text-green-800">Your Business Health Reporter account has been upgraded.</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Health Overview</h1>
          <p className="text-muted-foreground">
            A simple snapshot based on your latest uploaded product and supplier data.
          </p>
        </div>
        <Badge variant={source === "supabase" ? "default" : "secondary"}>
          Data source: {source === "supabase" ? "Supabase" : "Mock fallback"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Business Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-green-600">{report.healthScore}</span>
              <span className="pb-1 text-sm text-muted-foreground">/100</span>
              <Badge variant="outline" className="mb-1 ml-2 border-green-200 bg-green-50 text-green-700">
                {report.delta >= 0 ? "+" : ""}
                {report.delta} points vs last period
              </Badge>
            </div>
            <Progress
              value={report.healthScore}
              className="mt-4 h-3 bg-green-100"
              indicatorClassName="bg-green-600"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Data quality: <span className="font-medium text-foreground">{report.dataQualityScore}/100</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Product Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.averageMarginPercent.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Calculated from valid product rows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.categoryRows[0]?.category ?? "N/A"}</p>
            <p className="text-xs text-muted-foreground">
              Score {report.categoryRows[0]?.healthScore.toFixed(0) ?? "0"}/100
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-100 bg-green-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ArrowUpRight className="h-5 w-5" />
              What is improving the business
            </CardTitle>
            <CardDescription>Positive factors from your uploaded data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {report.improvingFactors.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ArrowDownRight className="h-5 w-5" />
              What is harming the business
            </CardTitle>
            <CardDescription>Areas holding back score growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {report.harmingFactors.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              How to increase the score
            </CardTitle>
            <CardDescription>Beginner-friendly next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {report.increaseActions.map((action, index) => (
                <li key={action} className="rounded-lg border bg-slate-50/50 p-3">
                  <span className="mr-2 font-semibold">{index + 1}.</span>
                  {action}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              What not to do
            </CardTitle>
            <CardDescription>Common actions to avoid right now</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {report.avoidActions.map((item) => (
                <li key={item} className="rounded-lg border border-red-100 bg-red-50/30 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
