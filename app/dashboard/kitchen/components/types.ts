import { OrderItem as BaseOrderItem, Order as BaseOrder } from '@/lib/types';

export interface OrderItem extends Omit<BaseOrderItem, 'productId' | 'productName' | 'price'> {
  id: number
  product_name: string
  variant_name: string
  category_name?: string
  category_slug?: string
  quantity: number
  status: string
}

export interface Order extends Omit<BaseOrder, 'id' | 'items' | 'status' | 'createdAt'> {
  id: number
  table_number: string
  type: string
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'paid'
  items: OrderItem[]
  created_at: string
}
