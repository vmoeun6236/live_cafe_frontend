"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon, LayoutDashboardIcon, Package2, TagIcon, TableIcon, ShoppingCartIcon, ChefHatIcon, BarChart3Icon, UsersIcon, Settings2Icon, Users2Icon, TruckIcon, ClipboardListIcon, ShoppingBagIcon, WarehouseIcon, ShieldIcon, DollarSignIcon, StarIcon, CreditCardIcon } from "lucide-react"
import { usePermissions, type Permission } from "@/hooks/use-permissions"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: <TagIcon />,
      permission: "view_category" as Permission,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: <Package2 />,
      permission: "view_product" as Permission,
    },
    {
      title: "Stock",
      url: "/dashboard/stock",
      icon: <WarehouseIcon />,
      permission: "view_stock" as Permission,
    },
    {
      title: "Tables",
      url: "/dashboard/tables",
      icon: <TableIcon />,
      permission: "view_table" as Permission,
    },
    {
      title: "POS",
      url: "/dashboard/pos",
      icon: <ShoppingCartIcon />,
      permission: "create_sale" as Permission,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: <ShoppingBagIcon />,
      permission: ["view_orders", "create_sale"] as any,
    },
    {
      title: "Kitchen",
      url: "/dashboard/kitchen",
      icon: <ChefHatIcon />,
      permission: ["view_orders", "create_sale"] as any,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: <Users2Icon />,
      permission: "view_customer" as Permission,
    },
    {
      title: "Suppliers",
      url: "/dashboard/suppliers",
      icon: <TruckIcon />,
      permission: "view_supplier" as Permission,
    },
    {
      title: "Purchase Orders",
      url: "/dashboard/purchase-orders",
      icon: <ClipboardListIcon />,
      permission: "view_purchase_order" as Permission,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <BarChart3Icon />,
      permission: "view_sales_report" as Permission,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <UsersIcon />,
      permission: "view_user" as Permission,
    },
    {
      title: "Roles",
      url: "/dashboard/roles",
      icon: <ShieldIcon />,
      permission: "view_role" as Permission,
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: <DollarSignIcon />,
      permission: "view_budget" as Permission,
    },
    {
      title: "Loyalty",
      url: "/dashboard/loyalty",
      icon: <StarIcon />,
      permission: "view_loyalty" as Permission,
    },
    {
      title: "Payment Gateways",
      url: "/dashboard/payment-gateways",
      icon: <CreditCardIcon />,
      permission: "view_payment_gateway" as Permission,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = React.useState(false)
  const { user, hasPermission } = usePermissions()

  React.useEffect(() => {
    queueMicrotask(() => {
      setMounted(true)
    })
  }, [])

  const filteredNavMain = data.navMain.filter(item => {
    if (!item.permission) return true
    if (Array.isArray(item.permission)) {
      return item.permission.some(p => hasPermission(p as Permission))
    }
    return hasPermission(item.permission as Permission)
  })

  if (!mounted) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <a href="/dashboard">
                  <img src="/logo.png" className="size-6 object-contain rounded-md" alt="Live Cafe Logo" />
                  <span className="text-base font-bold bg-gradient-to-r from-slate-950 to-slate-800 dark:from-white dark:to-slate-200 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">Live Cafe</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <img src="/logo.png" className="size-6 object-contain rounded-md" alt="Live Cafe Logo" />
                <span className="text-base font-bold bg-gradient-to-r from-slate-950 to-slate-800 dark:from-white dark:to-slate-200 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">Live Cafe</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name ?? '',
          email: user?.email ?? '',
          avatar: user?.avatar ?? '',
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}

