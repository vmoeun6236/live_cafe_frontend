"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { ShoppingBag, Utensils } from "lucide-react"
import { Category, CartItem, OrderDetails, Product, ProductVariant, CafeTable } from "./types"
import { ProductCard } from "./product-card"
import { CartDrawer } from "./cart-drawer"
import { OrderStatusView } from "./order-status-view"

interface OrderClientProps {
  table: CafeTable
  categories: Category[]
  tableId: string
}

export default function OrderClient({ table, categories, tableId }: OrderClientProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  // States
  const [activeCategory, setActiveCategory] = useState<number | null>(categories.length > 0 ? categories[0].id : null)
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false)

  // Tracking Order State
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null)
  const [activeOrder, setActiveOrder] = useState<OrderDetails | null>(null)

  // Load existing tracking order from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrderId = localStorage.getItem(`tracking_order_table_${tableId}`)
      if (savedOrderId) {
        setActiveOrderId(parseInt(savedOrderId))
      }
    }
  }, [tableId])

  // Poll active order status if tracking
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null)
      return
    }

    const fetchOrderStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/orders/${activeOrderId}`)
        const orderData = res.data.data as OrderDetails
        setActiveOrder(orderData)
      } catch (err) {
        console.error("Failed polling order status:", err)
      }
    }

    fetchOrderStatus()
    const interval = setInterval(fetchOrderStatus, 5000)

    return () => clearInterval(interval)
  }, [activeOrderId, API_URL])

  // Add Item to Cart
  const addToCart = (product: Product, variant: ProductVariant) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.variant.id === variant.id
      )
      
      if (existingIndex > -1) {
        const updated = [...prevCart]
        updated[existingIndex].quantity += 1
        return updated
      } else {
        return [...prevCart, { product, variant, quantity: 1 }]
      }
    })
  }

  // Update Cart Quantity
  const updateQuantity = (variantId: number, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.variant.id === variantId) {
            const newQty = item.quantity + change
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.variant.price) * item.quantity), 0)
  const tax = subtotal * 0.10 // 10% VAT
  const total = subtotal + tax

  // Submit Order to Kitchen
  const submitOrder = async () => {
    if (cart.length === 0) return

    try {
      setSubmittingOrder(true)
      const orderPayload = {
        table_id: parseInt(tableId as string),
        items: cart.map((item) => ({
          product_variant_id: item.variant.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.variant.price),
          subtotal: parseFloat(item.variant.price) * item.quantity
        }))
      }

      const res = await axios.post(`${API_URL}/public/orders`, orderPayload)
      const createdOrder = res.data.data

      // Save tracking details
      localStorage.setItem(`tracking_order_table_${tableId}`, createdOrder.id.toString())
      setActiveOrderId(createdOrder.id)
      
      // Clear cart
      setCart([])
      setIsCartOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit order. Please try again.")
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Clear Tracking to Order New Items
  const clearTracking = () => {
    if (window.confirm("Are you sure you want to stop tracking this order? This won't cancel the kitchen preparation.")) {
      localStorage.removeItem(`tracking_order_table_${tableId}`)
      setActiveOrderId(null)
      setActiveOrder(null)
    }
  }

  // Active Order Status View
  if (activeOrderId && activeOrder) {
    return (
      <OrderStatusView 
        order={activeOrder} 
        tableName={table.name} 
        onClearTracking={clearTracking} 
      />
    )
  }

  // Category-specific Products filtering
  const activeProducts = categories.find((c) => c.id === activeCategory)?.products || []

  return (
    <>
      <title>{table.name ? `${table.name} Menu | LiveCafe` : "Self-Service Menu | LiveCafe"}</title>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ☕ Live Cafe
          </h1>
          <p className="text-xs text-slate-400">Scan, Order & Enjoy</p>
        </div>
        <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-500 uppercase tracking-widest">
          {table.name}
        </span>
      </header>

      {/* Main Menu */}
      <main className="flex-1 flex flex-col">
        {/* Horizontal Category Nav */}
        <div className="sticky top-[73px] z-10 px-6 py-3.5 bg-slate-950/90 border-b border-slate-900/60 overflow-x-auto flex gap-2.5 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition duration-200 ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15"
                  : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="px-6 py-6 space-y-6 max-w-md mx-auto w-full">
          {activeProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Utensils className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">No active items in this category yet.</p>
            </div>
          ) : (
            activeProducts.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                onAddToCart={addToCart} 
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-5 py-4 bg-amber-500 text-slate-950 font-extrabold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition duration-200 animate-bounce"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span>View Order Cart</span>
            <span className="bg-slate-950 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      )}

      {/* Slide-up Cart Drawer Modal */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onSubmitOrder={submitOrder}
        submittingOrder={submittingOrder}
        subtotal={subtotal}
        tax={tax}
        total={total}
      />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        Powered by Live Cafe POS System
      </footer>
    </div>
    </>
  )
}
