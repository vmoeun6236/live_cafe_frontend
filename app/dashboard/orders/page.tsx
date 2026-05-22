"use client"

import * as React from "react"
import { useOrders } from "@/hooks/useOrders"
import { OrderFilters } from "./components/order-filters"
import { OrderCard } from "./components/order-card"
import { OrderDetailsDialog } from "./components/order-details-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCwIcon, PackageIcon, Loader2Icon } from "lucide-react"

export default function OrdersPage() {
    const { orders, isLoading, refetch, updateStatus, updatePayment, cancelOrder, updateOrderItems } = useOrders()
    const [search, setSearch] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [paymentFilter, setPaymentFilter] = React.useState<string>("all")
    const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null)
    const [detailsOpen, setDetailsOpen] = React.useState(false)

    const filtered = orders.filter(order => {
        const matchesSearch =
            order.table_number.toLowerCase().includes(search.toLowerCase()) ||
            order.id.toString().includes(search)
        const matchesStatus = statusFilter === "all" || order.status === statusFilter
        const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter
        return matchesSearch && matchesStatus && matchesPayment
    })

    const openDetails = (order: any) => {
        setSelectedOrder(order)
        setDetailsOpen(true)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Orders Management</h1>
                    <p className="text-muted-foreground">Track and manage all orders</p>
                </div>
                <Button onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCwIcon className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <OrderFilters
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                paymentFilter={paymentFilter}
                setPaymentFilter={setPaymentFilter}
                filteredCount={filtered.length}
            />

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <PackageIcon className="size-12 mb-2" />
                        <p>No orders found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onViewDetails={openDetails}
                            onMarkPaid={(id) => updatePayment.mutate({ id, payment_status: 'paid', total: order.total })}
                            updating={updatePayment.isPending}
                        />
                    ))}
                </div>
            )}

            <OrderDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                order={selectedOrder}
                updating={updateStatus.isPending || updatePayment.isPending || cancelOrder.isPending}
                onUpdateStatus={(id, status) => {
                    updateStatus.mutate({ id, status })
                    if (selectedOrder?.id === id) setDetailsOpen(false)
                }}
                onUpdatePayment={(id, payment_status, method) => {
                    updatePayment.mutate({ id, payment_status, total: selectedOrder?.total || 0, method })
                    if (selectedOrder?.id === id) setDetailsOpen(false)
                }}
                onUpdateItems={(id, items) => {
                    updateOrderItems.mutate({ id, items })
                }}
                onCancelOrder={(id) => {
                    if (window.confirm("Are you sure you want to cancel this order? Stock will be restored.")) {
                        cancelOrder.mutate(id)
                        if (selectedOrder?.id === id) setDetailsOpen(false)
                    }
                }}
            />
        </div>
    )
}
