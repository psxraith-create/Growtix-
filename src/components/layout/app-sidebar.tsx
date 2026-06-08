"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  FileCheck,
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
  Truck,
  Upload,
  WalletCards,
  PieChart,
  FileText,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Business Report", url: "/report", icon: FileText },
  { title: "Top Products", url: "/products", icon: Package },
  { title: "Category Insights", url: "/categories", icon: PieChart },
  { title: "Suppliers", url: "/suppliers", icon: Truck },
  { title: "Investment Plan", url: "/investment", icon: TrendingUp },
]

const dataNav = [
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Data Validation", url: "/data-validation", icon: FileCheck },
]

const accountNav = [
  { title: "Pricing", url: "/pricing", icon: WalletCards },
  { title: "Billing", url: "/settings/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold">HealthReporter</span>
            <span className="text-xs text-muted-foreground">Business Health Reporter</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Data Management
        </div>

        <SidebarMenu>
          {dataNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </div>

        <SidebarMenu>
          {accountNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="rounded-lg">BH</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Business Owner</span>
                <span className="truncate text-xs">account@business.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button variant="outline" size="sm" className="mx-2" onClick={signOut}>
          Sign out
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
