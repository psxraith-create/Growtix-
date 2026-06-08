import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getReportForUI } from "@/lib/live-report"
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ReportPage() {
  const { report, source } = await getReportForUI()

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Report</h1>
          <p className="text-muted-foreground">
            A comprehensive overview of your business health, factors, and actionable advice.
          </p>
        </div>
        <Badge variant={source === "supabase" ? "default" : "secondary"}>
          {source === "supabase" ? "Live Supabase data" : "Mock fallback data"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{report.healthScore}</p>
              {report.delta !== 0 && (
                <div className={`flex items-center text-sm font-medium ${report.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                  {report.delta > 0 ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
                  {Math.abs(report.delta)}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg. Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{report.averageMarginPercent.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{report.dataQualityScore}</p>
            <p className="text-xs text-muted-foreground mt-1">Data completeness score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Previous Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{report.previousHealthScore}</p>
            <p className="text-xs text-muted-foreground mt-1">Last evaluated health</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-100 dark:border-green-900/50">
          <CardHeader className="bg-green-50/50 dark:bg-green-900/10 pb-4">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" /> Improving Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {report.improvingFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
              {report.improvingFactors.length === 0 && (
                <li className="text-sm text-muted-foreground italic">No specific improving factors detected.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-100 dark:border-red-900/50">
          <CardHeader className="bg-red-50/50 dark:bg-red-900/10 pb-4">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <TrendingDown className="h-5 w-5" /> Harming Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {report.harmingFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm">{factor}</span>
                </li>
              ))}
              {report.harmingFactors.length === 0 && (
                <li className="text-sm text-muted-foreground italic">No harming factors detected. Great job!</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-4">Action Plan</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What to do more of</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.increaseActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{action}</span>
                </li>
              ))}
              {report.increaseActions.length === 0 && (
                <li className="text-sm text-muted-foreground italic">Keep monitoring the situation.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What to avoid</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.avoidActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md border border-destructive/10">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-medium text-destructive">
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{action}</span>
                </li>
              ))}
              {report.avoidActions.length === 0 && (
                <li className="text-sm text-muted-foreground italic">No immediate avoid actions suggested.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
