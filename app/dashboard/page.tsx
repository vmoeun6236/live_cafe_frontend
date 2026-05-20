"use client"

import * as React from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LoaderIcon,
  TrendingUpIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  RefreshCwIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  UtensilsIcon,
  CalendarIcon,
  CreditCardIcon
} from "lucide-react"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"

interface OrderItem {
  id: number
  product_name: string
  variant_name: string
  quantity: number
  unit_price: number | string
  subtotal: number | string
  status: string
}

interface Order {
  id: number
  table?: { number: string }
  table_number?: string
  type: string
  total: number | string
  tax?: number | string
  discount?: number | string
  status: string
  payment_method: string
  payment_status: string
  paid_amount?: number | null
  change_amount?: number | null
  paid_at?: string | null
  items?: OrderItem[]
  created_at: string
  created_at_human?: string
}

interface TopProduct {
  name: string
  total_qty: number
}

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Order[]
  topProducts: TopProduct[]
}

import { useSettings } from "@/hooks/use-settings"

export default function Page() {
  const { formatCurrency } = useSettings()
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [stats, setStats] = React.useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  })

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes, ordersRes, reportsRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: { data: [] } })),
        api.get("/categories").catch(() => ({ data: { data: [] } })),
        api.get("/orders").catch(() => ({ data: { data: [] } })),
        api.get("/reports/dashboard").catch(() => ({ data: { top_products: [] } }))
      ])

      const products = productsRes.data.data || []
      const categories = categoriesRes.data.data || []
      const orders = ordersRes.data.data || []
      const topProducts = reportsRes.data.top_products || []

      // Calculate total revenue from paid orders (check both status and payment_status)
      const paidOrders = orders.filter((o: { status: string; payment_status?: string }) =>
        o.status === 'paid' || o.payment_status === 'paid'
      )
      const totalRevenue = paidOrders.reduce((sum: number, order: { total: string | number }) =>
        sum + parseFloat(String(order.total || 0)), 0
      )

      // Get recent orders (last 10)
      const recentOrders = orders.slice(0, 10)

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders,
        topProducts
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    // Initial fetch
    queueMicrotask(() => {
      fetchDashboardData()
    })

    // Real-time updates via Echo
    if (window.Echo) {
      window.Echo.channel('orders')
        .listen('OrderUpdated', () => {
          fetchDashboardData()
        })
    }

    return () => {
      if (window.Echo) {
        window.Echo.leaveChannel('orders')
      }
    }
  }, [fetchDashboardData])

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true)
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      toast.success("Order status updated")
      fetchDashboardData()
      setDetailsOpen(false)
      setSelectedOrder(null)
    } catch (error: any) {
      console.error("Failed to update status:", error)
      toast.error(error.response?.data?.message || "Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePayment = async (orderId: number, paymentStatus: string) => {
    setUpdating(true)
    try {
      const order = stats.recentOrders.find(o => o.id === orderId)
      await api.patch(`/orders/${orderId}/payment`, {
        payment_status: paymentStatus,
        paid_amount: order?.total,
        change_amount: 0
      })
      toast.success("Payment status updated")
      fetchDashboardData()
      setDetailsOpen(false)
      setSelectedOrder(null)
    } catch (error: any) {
      console.error("Failed to update payment:", error)
      toast.error(error.response?.data?.message || "Failed to update payment")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) {
      return
    }

    setUpdating(true)
    try {
      await api.post(`/orders/${orderId}/cancel`)
      toast.success("Order cancelled and stock restored")
      fetchDashboardData()
      setDetailsOpen(false)
      setSelectedOrder(null)
    } catch (error: any) {
      console.error("Failed to cancel order:", error)
      toast.error(error.response?.data?.message || "Failed to cancel order")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      cooking: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      ready: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      served: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoaderIcon className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <title>Dashboard Overview</title>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCwIcon className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Daily Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSignIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCartIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Pending Queue", value: stats.recentOrders.filter(o => o.status === 'pending' || o.status === 'cooking').length, icon: ClockIcon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { title: "Low Stock", value: "Alerts", icon: PackageIcon, color: "text-amber-500", bg: "bg-amber-500/10" }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border">
          <ChartAreaInteractive />
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-6">
              <CardTitle className="text-xl font-bold">Live Order Feed</CardTitle>
              <CardDescription>Real-time view of kitchen activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <ShoppingCartIcon className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No orders in queue</p>
                </div>
              ) : (
                <div className="divide-y">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-6 hover:bg-muted/30 cursor-pointer transition-colors group"
                      onClick={() => {
                        setSelectedOrder(order)
                        setDetailsOpen(true)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center size-12 rounded-2xl bg-primary/5 text-primary font-black">
                          #{order.id.toString().slice(-2)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {order.type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                            {order.table && ` • Table ${order.table.number}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.created_at_human}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-foreground">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <Badge variant="secondary" className={`px-3 py-1 font-bold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling items</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PackageIcon className="size-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No sales data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.total_qty} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none bg-gradient-to-br from-background to-muted/20 shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-10 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <ShoppingCartIcon className="size-6 text-primary" />
                Order Detail #{selectedOrder?.id}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs px-3 py-1 font-bold ${getStatusColor(selectedOrder?.status || "")}`}>
                {selectedOrder?.status.toUpperCase()}
              </Badge>
              <Badge className={`text-xs px-3 py-1 font-bold ${getPaymentStatusColor(selectedOrder?.payment_status || "")}`}>
                {selectedOrder?.payment_status.toUpperCase()}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Details & Items */}
              <div className="md:col-span-7 space-y-6">
                {/* Core Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Order Type</span>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedOrder?.type === "dine_in" ? (
                        <>
                          <UtensilsIcon className="size-5 text-indigo-500" />
                          <span className="font-semibold text-foreground">Dine In (Table {selectedOrder?.table?.number || selectedOrder?.table_number})</span>
                        </>
                      ) : (
                        <>
                          <PackageIcon className="size-5 text-amber-500" />
                          <span className="font-semibold text-foreground">Takeaway / Delivery</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Method</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCardIcon className="size-5 text-emerald-500" />
                      <span className="font-semibold text-foreground capitalize">{selectedOrder?.payment_method || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <Card className="border shadow-none overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <PackageIcon className="size-4 text-muted-foreground" />
                      Items Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-[300px]">
                      <div className="divide-y">
                        {selectedOrder?.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item: any, index: number) => {
                            const parsedItem = typeof item === 'string' ? JSON.parse(item.replace(/@\{/g, '{').replace(/=/g, ':').replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/ : /g, ':')) : item;
                            return (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-sm text-foreground">{parsedItem.product_name}</p>
                                    {parsedItem.variant_name && (
                                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                                        {parsedItem.variant_name}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground">
                                      ${Number(parsedItem.unit_price).toFixed(2)} × {parsedItem.quantity}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                      ${Number(parsedItem.subtotal).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                            )
                          })
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No items found in this order
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: simulated thermal receipt */}
              <div className="md:col-span-5 flex justify-center">
                <div className="w-full max-w-xs bg-yellow-50/50 dark:bg-zinc-900/50 border border-yellow-100/50 dark:border-zinc-800 rounded-2xl p-6 shadow-md relative overflow-hidden font-mono text-sm text-foreground">
                  {/* Digital Thermal Receipt Look */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-200/50 dark:via-zinc-700/50 to-transparent"></div>
                  <div className="text-center space-y-1 pb-4 border-b border-dashed border-muted-foreground/30">
                    <h3 className="font-black text-lg tracking-tight uppercase">LiveCafe Restaurant</h3>
                    <p className="text-xs text-muted-foreground">123 Street, Phnom Penh</p>
                    <p className="text-xs text-muted-foreground">Tel: 012 345 678</p>
                  </div>

                  <div className="py-4 space-y-2 border-b border-dashed border-muted-foreground/30 text-xs">
                    <div className="flex justify-between">
                      <span>ORDER #:</span>
                      <span className="font-bold">{selectedOrder?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TYPE:</span>
                      <span className="font-bold uppercase">{selectedOrder?.type}</span>
                    </div>
                    {selectedOrder?.table && (
                      <div className="flex justify-between">
                        <span>TABLE #:</span>
                        <span className="font-bold">{selectedOrder.table.number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>PAYMENT:</span>
                      <span className="font-bold uppercase">{selectedOrder?.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATE:</span>
                      <span>{selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="py-4 space-y-2 text-xs border-b border-dashed border-muted-foreground/30">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span>${(Number(selectedOrder?.total || 0) - Number(selectedOrder?.tax || 0) + Number(selectedOrder?.discount || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TAX:</span>
                      <span>${Number(selectedOrder?.tax || 0).toFixed(2)}</span>
                    </div>
                    {Number(selectedOrder?.discount || 0) > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>DISCOUNT:</span>
                        <span>-${Number(selectedOrder?.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center text-base font-bold">
                    <span>TOTAL:</span>
                    <span className="text-lg">${Number(selectedOrder?.total || 0).toFixed(2)}</span>
                  </div>

                  <div className="mt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest border-t border-dashed border-muted-foreground/20 pt-4">
                    Thank you for your visit!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-background/50 border-t sticky bottom-0 z-10 flex gap-2">
            <div className="flex flex-1 gap-2">
              {selectedOrder && selectedOrder.status !== "cancelled" && selectedOrder.status !== "completed" && (
                <>
                  {selectedOrder.status === "pending" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cooking")}
                      disabled={updating}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      <ClockIcon className="size-4 mr-2" />
                      Start Cooking
                    </Button>
                  )}
                  {selectedOrder.status === "cooking" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "ready")}
                      disabled={updating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      <CheckCircleIcon className="size-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                  {selectedOrder.status === "ready" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "served")}
                      disabled={updating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      <UtensilsIcon className="size-4 mr-2" />
                      Mark Served
                    </Button>
                  )}
                  {selectedOrder.payment_status === "pending" && (
                    <Button
                      onClick={() => handleUpdatePayment(selectedOrder.id, "paid")}
                      disabled={updating}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <DollarSignIcon className="size-4 mr-2" />
                      Mark as Paid
                    </Button>
                  )}
                  <Button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={updating}
                    variant="destructive"
                    className="font-bold"
                  >
                    <XCircleIcon className="size-4 mr-2" />
                    Cancel Order
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="font-bold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
