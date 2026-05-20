import { OrderItem as BaseOrderItem, Order as BaseOrder } from '@/lib/types';

export interface OrderItem extends Omit<BaseOrderItem, 'productId' | 'productName' | 'price' | 'quantity'> {
    id: number
    product_name: string
    variant_name: string
    quantity: number
    unit_price: number
    subtotal: number
    status: string
}

export interface Order extends Omit<BaseOrder, 'id' | 'items' | 'status' | 'createdAt'> {
    id: number
    table_number: string
    type: string
    total: number
    tax: number
    discount: number
    status: string
    payment_method: string
    payment_status: string
    paid_amount: number | null
    change_amount: number | null
    paid_at: string | null
    items: OrderItem[]
    created_at: string
    created_at_human: string
}
