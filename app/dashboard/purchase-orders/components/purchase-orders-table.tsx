'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Edit, Trash2, Eye, Package, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from '@/lib/axios'
import { PurchaseOrder, Supplier, Product, POStatus } from './types'
import { PurchaseOrderFormDialog } from './purchase-order-form-dialog'

const STATUS_COLORS: Record<POStatus, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    ordered:   'bg-blue-100 text-blue-800',
    received:  'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export function PurchaseOrdersTable() {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)

    // ── Data fetching ──────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            const [poRes, suppliersRes, productsRes] = await Promise.all([
                axios.get('/purchase-orders'),
                axios.get('/suppliers'),
                axios.get('/products'),
            ])
            setPurchaseOrders(poRes.data.data ?? [])
            setSuppliers(suppliersRes.data.data ?? [])
            setProducts(productsRes.data.data ?? [])
        } catch (error) {
            toast.error('Failed to fetch data')
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleEdit = (po: PurchaseOrder) => {
        setEditingPO(po)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this purchase order?')) return
        try {
            await axios.delete(`/purchase-orders/${id}`)
            toast.success('Purchase order deleted successfully')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete purchase order')
            console.error('Error deleting purchase order:', error)
        }
    }

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await axios.patch(`/purchase-orders/${id}/status`, { status })
            toast.success('Status updated successfully')
            fetchData()
        } catch (error) {
            toast.error('Failed to update status')
            console.error('Error updating status:', error)
        }
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingPO(null)
    }

    // ── Derived state ──────────────────────────────────────────────────────────
    const filteredPOs = purchaseOrders.filter(po =>
        po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                Loading purchase orders…
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header + Dialog trigger */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">Manage your inventory procurement</p>
                </div>

                <PurchaseOrderFormDialog
                    editingPO={editingPO}
                    suppliers={suppliers}
                    products={products}
                    onSuccess={fetchData}
                    onClose={handleDialogClose}
                    isOpen={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) setEditingPO(null)
                    }}
                />
            </div>

            {/* Table card */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>Total orders: {purchaseOrders.length}</CardDescription>
                    <div className="flex items-center space-x-2 pt-1">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by PO number or supplier…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Expected Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPOs.map((po) => (
                                <TableRow key={po.id}>
                                    {/* PO Number */}
                                    <TableCell>
                                        <div className="font-medium flex items-center">
                                            <Package className="h-4 w-4 mr-2" />
                                            {po.po_number}
                                        </div>
                                    </TableCell>

                                    {/* Supplier */}
                                    <TableCell>{po.supplier?.name ?? '—'}</TableCell>

                                    {/* Order Date */}
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(po.order_date).toLocaleDateString()}
                                        </div>
                                    </TableCell>

                                    {/* Expected Date */}
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(po.expected_date).toLocaleDateString()}
                                        </div>
                                    </TableCell>

                                    {/* Total */}
                                    <TableCell>
                                        <div className="flex items-center font-medium">
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            {po.total_amount.toFixed(2)}
                                        </div>
                                    </TableCell>

                                    {/* Status inline select */}
                                    <TableCell>
                                        <Select
                                            value={po.status}
                                            onValueChange={(v) => handleStatusUpdate(po.id, v)}
                                        >
                                            <SelectTrigger className="w-36">
                                                <Badge className={STATUS_COLORS[po.status]}>
                                                    {po.status.toUpperCase()}
                                                </Badge>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="ordered">Ordered</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm" title="View details">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title="Edit"
                                                onClick={() => handleEdit(po)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title="Delete"
                                                onClick={() => handleDelete(po.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredPOs.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No purchase orders found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
