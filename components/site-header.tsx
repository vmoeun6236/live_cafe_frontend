"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pathnameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/pos": "POS Terminal",
  "/dashboard/tables": "Tables",
  "/dashboard/users": "Users",
  "/dashboard/kitchen": "Kitchen Display",
  "/dashboard/products": "Products",
  "/dashboard/categories": "Categories",
  "/dashboard/orders": "Orders",
  "/dashboard/settings": "Settings",
  "/dashboard/budgets": "Budgets",
  "/dashboard/customers": "Customers",
  "/dashboard/loyalty": "Loyalty",
  "/dashboard/payment-gateways": "Payment Gateways",
  "/dashboard/purchase-orders": "Purchase Orders",
  "/dashboard/reports": "Reports",
  "/dashboard/roles": "Roles",
  "/dashboard/stock": "Stock",
  "/dashboard/suppliers": "Suppliers",
}

export function SiteHeader({ title }: { title?: string }) {
  const pathname = usePathname()

  // Use explicit prop title if passed, otherwise resolve dynamically from pathname
  let resolvedTitle = title
  if (!resolvedTitle && pathname) {
    if (pathnameMap[pathname]) {
      resolvedTitle = pathnameMap[pathname]
    } else {
      // Dynamic fallback, e.g. /dashboard/tables/1 -> "Tables / 1"
      const segments = pathname.split("/").filter(Boolean)
      if (segments.length > 1) {
        const dashboardSubPath = segments.slice(1).map(s => {
          return s
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        })
        resolvedTitle = dashboardSubPath.join(" / ")
      }
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{resolvedTitle || "Dashboard"}</h1>
      </div>
    </header>
  )
}
