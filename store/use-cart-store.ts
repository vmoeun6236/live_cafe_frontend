import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    variant_id: number
    product_name: string
    size_name: string
    price: number
    quantity: number
}

interface CartStore {
    items: CartItem[]
    discount: number
    taxRate: number
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (variantId: number) => void
    updateQuantity: (variantId: number, quantity: number) => void
    clearCart: () => void
    setDiscount: (discount: number) => void
    subtotal: () => number
    total: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            discount: 0,
            taxRate: 0.1, // 10%

            addItem: (item) => set((state) => {
                const existing = state.items.find(i => i.variant_id === item.variant_id)
                if (existing) {
                    return {
                        items: state.items.map(i => 
                            i.variant_id === item.variant_id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    }
                }
                return { items: [...state.items, { ...item, quantity: 1 }] }
            }),

            removeItem: (variantId) => set((state) => ({
                items: state.items.filter(i => i.variant_id !== variantId)
            })),

            updateQuantity: (variantId, quantity) => set((state) => ({
                items: state.items.map(i => i.variant_id === variantId ? { ...i, quantity: Math.max(0, quantity) } : i)
                    .filter(i => i.quantity > 0)
            })),

            clearCart: () => set({ items: [], discount: 0 }),
            
            setDiscount: (discount) => set({ discount }),

            subtotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),

            total: () => {
                const sub = get().subtotal()
                const tax = sub * get().taxRate
                return sub + tax - get().discount
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
