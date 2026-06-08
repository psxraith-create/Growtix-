import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default async function SuppliersPage() {
  const { report, source } = await getReportForUI()
  const suppliers = report.supplierRows

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Compare supplier reliability, lead time, and impact on your product margins.
          </p>
        </div>
        <Badge variant={source === "supabase" ? "default" : "secondary"}>
          {source === "supabase" ? "Live Supabase data" : "Mock fallback data"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Supplier Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(
                suppliers.reduce((sum, supplier) => sum + supplier.score, 0) /
                Math.max(1, suppliers.length)
              ).toFixed(0)}
              /100
            </p>
            <p className="text-xs text-muted-foreground">Based on margin, reliability, and lead time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Positive Impact Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {suppliers.filter((item) => item.impact === "Positive").length}
            </p>
            <p className="text-xs text-muted-foreground">Helping improve health score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {suppliers.filter((item) => item.impact === "Negative").length}
            </p>
            <p className="text-xs text-muted-foreground">At-risk supplier relationships</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier score table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Products Supplied</TableHead>
                <TableHead>Avg Unit Cost</TableHead>
                <TableHead>Avg Margin</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Reliability</TableHead>
                <TableHead>Supplier Score</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.supplierName}>
                  <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                  <TableCell>{supplier.productsSupplied}</TableCell>
                  <TableCell>${supplier.averageUnitCost.toFixed(2)}</TableCell>
                  <TableCell>{supplier.averageMarginPercent.toFixed(1)}%</TableCell>
                  <TableCell>{supplier.leadTimeDays} days</TableCell>
                  <TableCell>{supplier.reliabilityRate.toFixed(0)}%</TableCell>
                  <TableCell>{supplier.score.toFixed(0)}/100</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supplier.impact === "Positive"
                          ? "default"
                          : supplier.impact === "Neutral"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {supplier.impact}
                    </Badge>
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
