"use client"

import React from "react"
import { Order } from "./types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UtensilsIcon, PackageIcon, EyeIcon, CheckCircleIcon } from "lucide-react"

interface OrderCardProps {
    order: Order
    onViewDetails: (order: Order) => void
    onMarkPaid: (orderId: number) => void
    updating: boolean
}

export function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-500",
        cooking: "bg-orange-500",
        ready: "bg-blue-500",
        served: "bg-green-500",
        paid: "bg-emerald-500",
        completed: "bg-gray-500",
        cancelled: "bg-red-500"
    }
    return colors[status] || "bg-gray-500"
}

export function getPaymentStatusColor(status: string) {
    const colors: Record<string, string> = {
        pending: "bg-yellow-500",
        paid: "bg-green-500",
        refunded: "bg-blue-500",
        cancelled: "bg-red-500"
    }
    return colors[status] || "bg-gray-500"
}

export function OrderCard({ order, onViewDetails, onMarkPaid, updating }: OrderCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            {order.type === 'dine_in' ? (
                                <><UtensilsIcon className="size-3" /> Floor {order.table?.floor || 'N/A'} - Table {order.table?.number || 'N/A'}</>
                            ) : (
                                <><PackageIcon className="size-3" /> Takeaway</>
                            )}
                        </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="capitalize">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{order.created_at_human}</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewDetails(order)}
                    >
                        <EyeIcon className="size-3 mr-1" />
                        Details
                    </Button>
                    {order.payment_status === 'pending' && (
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => onMarkPaid(order.id)}
                            disabled={updating}
                        >
                            <CheckCircleIcon className="size-3 mr-1" />
                            Mark Paid
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
