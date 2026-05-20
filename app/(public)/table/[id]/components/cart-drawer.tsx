"use client"

import React from "react"
import { ShoppingBag, X, Minus, Plus, Loader2, ArrowRight } from "lucide-react"
import { CartItem } from "./types"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (variantId: number, change: number) => void
  onSubmitOrder: () => void
  submittingOrder: boolean
  subtotal: number
  tax: number
  total: number
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onSubmitOrder,
  submittingOrder,
  subtotal,
  tax,
  total
}: CartDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm transition duration-300">
      <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">Your Selections</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full transition duration-150 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.map((item) => (
            <div key={item.variant.id} className="flex justify-between items-center bg-slate-850/40 p-3.5 rounded-2xl border border-slate-800/30">
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                <p className="text-xs text-slate-400">Size: {item.variant.size_name}</p>
                <p className="text-xs text-amber-500 font-bold mt-0.5">${parseFloat(item.variant.price).toFixed(2)} each</p>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateQuantity(item.variant.id, -1)}
                  className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.variant.id, 1)}
                  className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary & Submit */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-dashed border-slate-800 mt-2">
              <span>Total Bill (Pay Later)</span>
              <span className="text-amber-500">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onSubmitOrder}
            disabled={submittingOrder}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:text-slate-950/60 disabled:cursor-not-allowed text-slate-950 font-black rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/10"
          >
            {submittingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Order to Kitchen...
              </>
            ) : (
              <>
                Submit Order to Kitchen
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
