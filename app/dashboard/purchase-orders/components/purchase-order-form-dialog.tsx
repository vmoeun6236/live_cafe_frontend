'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from '@/lib/axios'
import {
    PurchaseOrder, Supplier, Product,
    POFormData, DEFAULT_FORM_DATA,
} from './types'

interface PurchaseOrderFormDialogProps {
    editingPO: PurchaseOrder | null
    suppliers: Supplier[]
    products: Product[]
    onSuccess: () => void
    onClose: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function PurchaseOrderFormDialog({
    editingPO,
    suppliers,
    products,
    onSuccess,
    onClose,
    isOpen,
    onOpenChange,
}: PurchaseOrderFormDialogProps) {
    const [formData, setFormData] = React.useState<POFormData>(DEFAULT_FORM_DATA)

    // Populate form when editing
    React.useEffect(() => {
        if (editingPO) {
            setFormData({
                supplier_id: editingPO.supplier_id.toString(),
                expected_date: editingPO.expected_date.split('T')[0],
                notes: editingPO.notes ?? '',
                items: editingPO.items?.map(item => ({
                    product_id: item.product_id.toString(),
                    quantity_ordered: item.quantity_ordered,
                    unit_cost: item.unit_cost,
                })) ?? [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }],
            })
        } else {
            setFormData(DEFAULT_FORM_DATA)
        }
    }, [editingPO])

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity_ordered: 1, unit_cost: 0 }],
        }))
    }

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }))
    }

    const updateItem = (index: number, field: string, value: string | number) => {
        setFormData(prev => {
            const items = [...prev.items]
            items[index] = { ...items[index], [field]: value }
            return { ...prev, items }
        })
    }

    const handleProductSelect = (index: number, value: string) => {
        updateItem(index, 'product_id', value)
        const product = products.find(p => p.id.toString() === value)
        if (product) updateItem(index, 'unit_cost', product.cost_price)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                supplier_id: parseInt(formData.supplier_id),
                items: formData.items.map(item => ({
                    ...item,
                    product_id: parseInt(item.product_id),
                    quantity_ordered: parseInt(item.quantity_ordered.toString()),
                    unit_cost: parseFloat(item.unit_cost.toString()),
                })),
            }

            if (editingPO) {
                await axios.put(`/purchase-orders/${editingPO.id}`, payload)
                toast.success('Purchase order updated successfully')
            } else {
                await axios.post('/purchase-orders', payload)
                toast.success('Purchase order created successfully')
            }

            onSuccess()
            onClose()
        } catch (error) {
            toast.error('Failed to save purchase order')
            console.error('Error saving purchase order:', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={onClose}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingPO ? 'Edit Purchase Order' : 'Create New Purchase Order'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingPO
                            ? 'Update purchase order details'
                            : 'Create a new purchase order for inventory procurement'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Supplier & Expected Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier_id">Supplier *</Label>
                            <Select
                                value={formData.supplier_id}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, supplier_id: v }))}
                            >
                                <SelectTrigger id="supplier_id">
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expected_date">Expected Date *</Label>
                            <Input
                                id="expected_date"
                                type="date"
                                value={formData.expected_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-5 gap-2 items-end p-4 border rounded-lg"
                            >
                                {/* Product */}
                                <div className="space-y-2">
                                    <Label>Product</Label>
                                    <Select
                                        value={item.product_id}
                                        onValueChange={(v) => handleProductSelect(index, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name} ({p.sku})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity_ordered}
                                        onChange={(e) =>
                                            updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 1)
                                        }
                                    />
                                </div>

                                {/* Unit Cost */}
                                <div className="space-y-2">
                                    <Label>Unit Cost</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.unit_cost}
                                        onChange={(e) =>
                                            updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                {/* Line Total (read-only) */}
                                <div className="space-y-2">
                                    <Label>Total</Label>
                                    <Input
                                        value={`$${(item.quantity_ordered * item.unit_cost).toFixed(2)}`}
                                        disabled
                                    />
                                </div>

                                {/* Remove */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                    disabled={formData.items.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingPO ? 'Update Purchase Order' : 'Create Purchase Order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
