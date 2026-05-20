import { Category as BaseCategory, Product as BaseProduct, CafeTable as BaseCafeTable } from '@/lib/types';

export interface Variant {
    id: number
    size_name: string
    price: number
    stock_qty?: number
    barcode?: string
}

export interface Category extends Omit<BaseCategory, 'id'> {
    id: number
    slug: string
    image?: string
    status: string
}

export interface Product extends Omit<BaseProduct, 'id' | 'categoryId'> {
    id: number
    description?: string
    image?: string
    status: string
    category?: Category
    variants: Variant[]
}

export interface CafeTable extends Omit<BaseCafeTable, 'id' | 'status'> {
    id: number
    number: string
    capacity: number
    status: 'available' | 'occupied' | 'cleaning' | 'reserved'
}
