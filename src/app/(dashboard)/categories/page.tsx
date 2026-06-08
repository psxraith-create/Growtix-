import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getReportForUI } from "@/lib/live-report"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const { report, source } = await getReportForUI()
  const categories = report.categoryRows

  const strongCount = categories.filter((item) => item.healthScore >= 70).length
  const totalRevenue = categories.reduce((sum, item) => sum + item.revenue, 0)
  const avgMargin = report.averageMarginPercent

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Insights</h1>
          <p className="text-muted-foreground">
            Analyze revenue, margin, and health score by product category.
          </p>
        </div>
        <Badge variant={source === "supabase" ? "default" : "secondary"}>
          {source === "supabase" ? "Live Supabase data" : "Mock fallback data"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Category Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Across all valid categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Overall category margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Strong Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{strongCount}</p>
            <p className="text-xs text-muted-foreground">Scoring 70+ on health score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Health Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>${category.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>{category.marginPercent.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="w-[140px] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>{category.healthScore.toFixed(0)}/100</span>
                        <Badge
                          variant={
                            category.healthScore >= 70
                              ? "default"
                              : category.healthScore >= 40
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {category.healthScore >= 70
                            ? "Strong"
                            : category.healthScore >= 40
                            ? "Stable"
                            : "Needs Attention"}
                        </Badge>
                      </div>
                      <Progress
                        value={category.healthScore}
                        className="h-2"
                        indicatorClassName={
                          category.healthScore >= 70
                            ? "bg-green-600"
                            : category.healthScore >= 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
