import { z } from "zod"
import { Category as BaseCategory, Product as BaseProduct } from '@/lib/types';

export interface Category extends Omit<BaseCategory, 'id'> {
    id: number
    slug: string
    image: string | null
    status: 'active' | 'inactive'
}

export const variantSchema = z.object({
    id: z.number().optional(),
    size_name: z.string().min(1, "Required"),
    price: z.coerce.number().min(0, "Must be >= 0"),
    stock_qty: z.coerce.number().int("Must be an integer").min(0, "Must be >= 0"),
    barcode: z.string().optional(),
})

export const productFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().or(z.literal('')),
    category_id: z.string().min(1, "Category is required"),
    status: z.enum(['active', 'inactive']).default('active'),
    variants: z.array(variantSchema).min(1, "At least one variant is required"),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export interface ProductVariant {
    id: number
    size_name: string
    price: number
    stock_qty: number
    barcode?: string
}

export interface Product extends Omit<BaseProduct, 'id' | 'categoryId' | 'category'> {
    id: number
    description: string
    status: 'active' | 'inactive'
    image: string | null
    category: Category
    variants: ProductVariant[]
}
