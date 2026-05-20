export interface Supplier {
    id: number
    name: string
}

export interface Product {
    id: number
    name: string
    sku: string
    cost_price: number
}

export interface PurchaseOrderItem {
    id: number
    product_id: number
    product?: {
        id: number
        name: string
        sku: string
    }
    quantity_ordered: number
    quantity_received: number
    unit_cost: number
    total_cost: number
}

export type POStatus = 'pending' | 'ordered' | 'received' | 'cancelled'

export interface PurchaseOrder {
    id: number
    po_number: string
    supplier_id: number
    supplier?: {
        id: number
        name: string
    }
    order_date: string
    expected_date: string
    received_date?: string
    status: POStatus
    subtotal: number
    tax_amount: number
    total_amount: number
    notes: string
    created_at: string
    updated_at: string
    items?: PurchaseOrderItem[]
}

export interface POFormItem {
    product_id: string
    quantity_ordered: number
    unit_cost: number
}

export interface POFormData {
    supplier_id: string
    expected_date: string
    notes: string
    items: POFormItem[]
}

export const DEFAULT_FORM_DATA: POFormData = {
    supplier_id: '',
    expected_date: '',
    notes: '',
    items: [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }],
}
