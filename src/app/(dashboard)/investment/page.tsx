import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Sparkles,
  Target,
  TrendingDown,
  Zap,
} from "lucide-react"

export default function InvestmentPlanPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Plan</h1>
          <p className="text-muted-foreground">
            A simple, beginner-friendly plan based on your current business data.
          </p>
        </div>
        <Button className="gap-2 w-fit">
          <Sparkles className="h-4 w-4" /> Refresh Suggestions
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Top Priority
            </CardTitle>
            <CardDescription>Where your next budget should go first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Grow Organic Cotton Products</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                These products show the strongest margin and repeat sales in your file.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm font-medium">
                  <span>Confidence</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm font-medium">
                  <span>Estimated 12-month ROI</span>
                  <span>+185%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Zap className="h-4 w-4 text-amber-500" />
                Next Action
              </h4>
              <p className="text-sm text-muted-foreground">
                Invest $5,000 in high-margin inventory to prevent stockouts over the next 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reduce Spending Here</CardTitle>
              <CardDescription>Areas currently lowering your score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-100 bg-red-50/20 p-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Legacy Leather Inventory</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pause new purchases. Current stock is moving slowly and tying up cash.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-100 bg-amber-50/20 p-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">West Coast Ad Budget</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reduce spend until shipping costs normalize in this region.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Future Opportunities</CardTitle>
              <CardDescription>Growth ideas worth testing next</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">B2B sustainable gifting kits</span>
                <Badge variant="outline">High potential</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Subscription eco starter packs</span>
                <Badge variant="outline">Evaluate</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
