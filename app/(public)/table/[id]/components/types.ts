export interface ProductVariant {
  id: number
  product_id: number
  size_name: string
  price: string
  stock_qty: number | null
  barcode: string | null
}

export interface Product {
  id: number
  category_id: number
  name: string
  description: string | null
  status: string
  variants: ProductVariant[]
  image?: string
  image_url?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  status: string
  products: Product[]
}

export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface OrderItem {
  id: number
  product_variant_id: number
  quantity: number
  unit_price: string
  subtotal: string
  variant?: {
    size_name: string
    product?: {
      name: string
    }
  }
}

export interface OrderDetails {
  id: number
  table_id: number
  type: string
  total: string
  tax: string
  discount: string
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'paid' | 'completed' | 'cancelled'
  created_at: string
  items: OrderItem[]
}

export interface CafeTable {
  id: number
  name: string
  number: string
  capacity: number
  status: string
}
