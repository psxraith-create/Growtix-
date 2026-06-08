import { AppSidebar } from "@/components/layout/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div>
              <p className="text-sm font-medium">Business Health Reporter</p>
              <p className="text-xs text-muted-foreground">Simple insights for small businesses</p>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-slate-50/50 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
