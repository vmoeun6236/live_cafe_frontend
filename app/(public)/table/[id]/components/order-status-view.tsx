"use client"

import React from "react"
import { Clock, ChefHat, Sparkles, Utensils, Check, X, Loader2 } from "lucide-react"
import { OrderDetails } from "./types"

interface OrderStatusViewProps {
  order: OrderDetails
  tableName: string
  onClearTracking: () => void
}

export function OrderStatusView({ order, tableName, onClearTracking }: OrderStatusViewProps) {
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-12 h-12 text-amber-400 animate-pulse" />,
          title: "Order Placed",
          desc: "Your order has been sent to the kitchen. Waiting for approval.",
          color: "border-amber-500 bg-amber-500/10 text-amber-400"
        }
      case 'cooking':
        return {
          icon: <ChefHat className="w-12 h-12 text-orange-400 animate-bounce" />,
          title: "Cooking in Progress",
          desc: "Our chefs are preparing your delicious meals now!",
          color: "border-orange-500 bg-orange-500/10 text-orange-400"
        }
      case 'ready':
        return {
          icon: <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />,
          title: "Ready to Serve!",
          desc: "Your food is ready and on its way to your table!",
          color: "border-emerald-500 bg-emerald-500/10 text-emerald-400"
        }
      case 'served':
        return {
          icon: <Utensils className="w-12 h-12 text-blue-400" />,
          title: "Served",
          desc: "Your meal has been served. Enjoy your food!",
          color: "border-blue-500 bg-blue-500/10 text-blue-400"
        }
      case 'paid':
      case 'completed':
        return {
          icon: <Check className="w-12 h-12 text-emerald-500" />,
          title: "Paid & Satisified",
          desc: "Thank you for dining with us! Have a wonderful day!",
          color: "border-emerald-500 bg-emerald-500/5 text-emerald-500"
        }
      case 'cancelled':
        return {
          icon: <X className="w-12 h-12 text-rose-500" />,
          title: "Order Cancelled",
          desc: "This order has been cancelled by staff.",
          color: "border-rose-500 bg-rose-500/10 text-rose-500"
        }
      default:
        return {
          icon: <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />,
          title: "Processing...",
          desc: "Updating order status.",
          color: "border-slate-700 bg-slate-800/50 text-slate-400"
        }
    }
  }

  const statusObj = getStatusDetails(order.status)

  return (
    <>
      <title>{tableName ? `Track Order - ${tableName}` : "Track Order | LiveCafe"}</title>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            ☕ Live Cafe
          </h1>
          <p className="text-xs text-slate-400">Order Tracking</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-500 uppercase tracking-widest">
          {tableName}
        </span>
      </header>

      {/* Tracking Details */}
      <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className={`w-full border rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl mb-8 ${statusObj.color}`}>
          <div className="p-4 bg-slate-900/60 rounded-full shadow-inner mb-4">
            {statusObj.icon}
          </div>
          <h2 className="text-2xl font-black mb-2 text-white">{statusObj.title}</h2>
          <p className="text-sm opacity-90 max-w-xs">{statusObj.desc}</p>
        </div>

        {/* Receipt Preview */}
        <div className="w-full bg-slate-900/60 border border-slate-850 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2.5 mb-3 uppercase tracking-wider">
            Order Receipt (ID: #{order.id})
          </h3>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-slate-400">
                  {item.variant?.product?.name || "Product"}
                  <span className="text-xs text-slate-500 block">
                    Size: {item.variant?.size_name || "Regular"}
                  </span>
                </span>
                <span className="text-slate-200 font-medium">
                  x{item.quantity} - ${parseFloat(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(parseFloat(order.total) - parseFloat(order.tax)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-dashed border-slate-800 mt-2">
              <span>Total Due</span>
              <span className="text-amber-500">${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action to Order More */}
        <div className="w-full flex gap-3">
          <button
            onClick={onClearTracking}
            className="flex-1 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-850 transition duration-200 text-sm flex items-center justify-center gap-2"
          >
            Order More / Clear
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        Powered by Live Cafe POS System
      </footer>
    </div>
    </>
  )
}
