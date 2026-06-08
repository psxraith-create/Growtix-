import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getValidationForUI } from "@/lib/live-report"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileWarning,
  Search,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DataValidationPage({
  searchParams,
}: {
  searchParams: Promise<{ uploadId?: string }>
}) {
  const params = await searchParams
  const { validation, source, resolvedUploadId } = await getValidationForUI(params.uploadId ?? null)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Validation complete</span>
          </div>
          <h1 className="text-3xl font-bold">Data Validation Results</h1>
          <p className="mt-2 text-muted-foreground">
            We checked your spreadsheet for missing values and risky entries before score calculation.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={source === "supabase" ? "default" : "secondary"}>
            {source === "supabase" ? "Loaded from Supabase" : "Showing mock fallback"}
          </Badge>
          {resolvedUploadId ? (
            <span className="text-xs text-muted-foreground">Upload ID: {resolvedUploadId}</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-red-100">
          <CardHeader className="bg-red-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <FileWarning className="h-5 w-5" />
                Critical Errors ({validation.errors.length})
              </CardTitle>
              <Badge variant="destructive">Needs Action</Badge>
            </div>
            <CardDescription>These rows should be fixed before final reporting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {validation.errors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No critical errors found.</p>
            ) : (
              validation.errors.map((issue, index) => (
                <div key={`${issue.code}-${index}`} className="rounded-lg border border-red-100 bg-red-50/20 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">
                        {issue.rowNumber ? `Row ${issue.rowNumber}: ` : ""}
                        {issue.message}
                      </p>
                      <p className="mt-1 text-sm text-red-800">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-100">
          <CardHeader className="bg-amber-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Search className="h-5 w-5" />
                Warnings ({validation.warnings.length})
              </CardTitle>
              <Badge variant="outline" className="border-amber-200 text-amber-700">
                Recommended
              </Badge>
            </div>
            <CardDescription>These issues can lower confidence in your recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {validation.warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No warnings found.</p>
            ) : (
              validation.warnings.map((issue, index) => (
                <div key={`${issue.code}-${index}`} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">
                    {issue.rowNumber ? `Row ${issue.rowNumber}: ` : ""}
                    {issue.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.recommendation}</p>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="border-t bg-slate-50/40 text-sm text-muted-foreground">
            Data quality score:
            <span className="ml-1 font-semibold text-foreground">{validation.dataQualityScore}/100</span>
            <span className="ml-4">Completion: {validation.completionRate}%</span>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Link href="/upload">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Re-upload File
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              Continue to Dashboard <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
