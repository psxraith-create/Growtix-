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

export default async function ProductsPage() {
  const { report, source } = await getReportForUI()
  const products = report.productRows

  const strongCount = products.filter((item) => item.score >= 75).length
  const attentionCount = products.filter((item) => item.score < 55).length

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Products</h1>
          <p className="text-muted-foreground">
            Product margin, sales, and inventory performance from your imported sheet.
          </p>
        </div>
        <Badge variant={source === "supabase" ? "default" : "secondary"}>
          {source === "supabase" ? "Live Supabase data" : "Mock fallback data"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.averageMarginPercent.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Across valid product rows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Strong Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{strongCount}</p>
            <p className="text-xs text-muted-foreground">Scoring 75+ on product health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{attentionCount}</p>
            <p className="text-xs text-muted-foreground">Low margin or overstock risk</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product score table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Product Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={`${product.productName}-${product.location}-${product.supplierName}`}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>{product.supplierName}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>${product.unitCost.toFixed(2)}</TableCell>
                  <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.marginPercent.toFixed(1)}%</TableCell>
                  <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="w-[140px] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>{product.score.toFixed(0)}/100</span>
                        <Badge
                          variant={
                            product.status === "Strong"
                              ? "default"
                              : product.status === "Stable"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <Progress
                        value={product.score}
                        className="h-2"
                        indicatorClassName={
                          product.score >= 75
                            ? "bg-green-600"
                            : product.score >= 55
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
