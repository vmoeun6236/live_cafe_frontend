"use client"

import React from "react"
import { Order } from "./types"
import { getStatusColor, getPaymentStatusColor } from "./order-card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ClockIcon,
    CheckCircleIcon,
    UtensilsIcon,
    DollarSignIcon,
    XCircleIcon,
    PackageIcon
} from "lucide-react"

interface OrderDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order: Order | null
    updating: boolean
    onUpdateStatus: (orderId: number, status: string) => void
    onUpdatePayment: (orderId: number, status: string, method?: string) => void
    onUpdateItems: (orderId: number, items: any[]) => void
    onCancelOrder: (orderId: number) => void
}

export function OrderDetailsDialog({
    open,
    onOpenChange,
    order,
    updating,
    onUpdateStatus,
    onUpdatePayment,
    onUpdateItems,
    onCancelOrder
}: OrderDetailsDialogProps) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [isPaying, setIsPaying] = React.useState(false)
    const [selectedMethod, setSelectedMethod] = React.useState('cash')
    const [items, setItems] = React.useState<any[]>([])

    React.useEffect(() => {
        if (order) setItems(order.items || [])
    }, [order])

    const handleMarkPaid = () => {
        if (order) {
            onUpdatePayment(order.id, 'paid', selectedMethod)
            setIsPaying(false)
        }
    }

    const handleSaveItems = () => {
        if (order) {
            onUpdateItems(order.id, items.map(item => ({
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.unit_price * item.quantity
            })))
            setIsEditing(false)
        }
    }

    if (!order) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Order #{order.id} Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Order Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Type:</span>
                                <p className="font-medium capitalize flex items-center gap-1">
                                    {order.type === 'dine_in' ? (
                                        <><UtensilsIcon className="size-3" /> Dine In</>
                                    ) : (
                                        <><PackageIcon className="size-3" /> Takeaway</>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Location:</span>
                                <p className="font-medium">
                                    {order.type === 'dine_in' 
                                        ? `Floor ${order.table?.floor || 'N/A'} - Table ${order.table?.number || 'N/A'}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status:</span>
                                <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Created:</span>
                                <p className="font-medium">{order.created_at_human}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium capitalize">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge className={getPaymentStatusColor(order.payment_status)}>
                                    {order.payment_status}
                                </Badge>
                            </div>
                            {order.paid_amount !== null && order.paid_amount !== undefined && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid Amount:</span>
                                    <span className="font-medium">${Number(order.paid_amount).toFixed(2)}</span>
                                </div>
                            )}
                            {order.change_amount && order.change_amount > 0 ? (
                                <div className="flex justify-between text-green-600">
                                    <span>Change:</span>
                                    <span className="font-medium">${order.change_amount.toFixed(2)}</span>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Order Items</CardTitle>
                            {order.status !== 'cancelled' && order.status !== 'completed' && (
                                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => isEditing ? handleSaveItems() : setIsEditing(true)}>
                                    {isEditing ? "Save Changes" : "Edit Items"}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="max-h-64">
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.product_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{item.variant_name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button variant="outline" size="icon" className="size-6" onClick={() => setItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))}>-</Button>
                                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                                        <Button variant="outline" size="icon" className="size-6" onClick={() => setItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: it.quantity + 1 } : it))}>+</Button>
                                                    </>
                                                ) : (
                                                    <p className="text-sm">× {item.quantity}</p>
                                                )}
                                                <p className="text-sm font-semibold ml-2 w-16 text-right">${(item.unit_price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <CardContent className="p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${(order.total - order.tax + order.discount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount:</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span className="text-primary">${order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                            <>
                                {order.status === 'pending' && (
                                    <Button
                                        onClick={() => onUpdateStatus(order.id, 'cooking')}
                                        disabled={updating}
                                        className="flex-1"
                                    >
                                        <ClockIcon className="size-4 mr-2" />
                                        Start Cooking
                                    </Button>
                                )}
                                {order.status === 'cooking' && (
                                    <Button
                                        onClick={() => onUpdateStatus(order.id, 'ready')}
                                        disabled={updating}
                                        className="flex-1"
                                    >
                                        <CheckCircleIcon className="size-4 mr-2" />
                                        Mark Ready
                                    </Button>
                                )}
                                {order.status === 'ready' && (
                                    <Button
                                        onClick={() => onUpdateStatus(order.id, 'served')}
                                        disabled={updating}
                                        className="flex-1"
                                    >
                                        <UtensilsIcon className="size-4 mr-2" />
                                        Mark Served
                                    </Button>
                                )}
                                {order.payment_status === 'pending' && (
                                    <>
                                        {!isPaying ? (
                                            <Button
                                                onClick={() => setIsPaying(true)}
                                                disabled={updating}
                                                variant="default"
                                                className="flex-1"
                                            >
                                                <DollarSignIcon className="size-4 mr-2" />
                                                Mark as Paid
                                            </Button>
                                        ) : (
                                            <div className="flex-1 flex gap-2 items-center">
                                                <select
                                                    className="border rounded px-2 py-1 flex-1 text-sm bg-background"
                                                    value={selectedMethod}
                                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="khqr">KHQR</option>
                                                </select>
                                                <Button size="sm" onClick={handleMarkPaid}>Confirm</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsPaying(false)}>Cancel</Button>
                                            </div>
                                        )}
                                    </>
                                )}
                                <Button
                                    onClick={() => onCancelOrder(order.id)}
                                    disabled={updating}
                                    variant="destructive"
                                >
                                    <XCircleIcon className="size-4 mr-2" />
                                    Cancel Order
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
