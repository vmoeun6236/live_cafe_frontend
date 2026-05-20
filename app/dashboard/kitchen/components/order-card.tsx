"use client"

import React from "react"
import { Order } from "./types"
import { isDrinkItem, useElapsedTime } from "./utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Square, ChefHat, Coffee, Timer, Play, CheckCircle2 } from "lucide-react"

interface OrderCardProps {
  order: Order
  stationMode: 'kitchen' | 'bar' | 'all'
  checkedItems: Record<string, boolean>
  toggleItemChecked: (orderId: number, itemId: number) => void
  updateStatus: (id: number, status: string) => void
}

export function OrderCard({
  order,
  stationMode,
  checkedItems,
  toggleItemChecked,
  updateStatus
}: OrderCardProps) {
  const { elapsed, secondsElapsed } = useElapsedTime(order.created_at)

  const isUrgent = secondsElapsed >= 600
  const isWarning = secondsElapsed >= 300 && secondsElapsed < 600

  let borderStyle = "border-l-8 border-l-slate-400 border border-border"
  let headerBg = "bg-muted/40"
  
  if (order.status === 'pending') {
    if (isUrgent) {
      borderStyle = "border-l-8 border-l-rose-500 border border-rose-200 shadow-md animate-pulse"
      headerBg = "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
    } else if (isWarning) {
      borderStyle = "border-l-8 border-l-amber-500 border border-amber-200 shadow-md"
      headerBg = "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
    } else {
      borderStyle = "border-l-8 border-l-amber-500/50 border border-border shadow-sm"
      headerBg = "bg-amber-50/50 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400"
    }
  } else if (order.status === 'cooking') {
    borderStyle = "border-l-8 border-l-sky-500 border border-sky-200 shadow-sm"
    headerBg = "bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400"
  }

  // Filter items based on stationMode
  const displayedItems = order.items.filter(item => {
    if (stationMode === 'kitchen') return !isDrinkItem(item)
    if (stationMode === 'bar') return isDrinkItem(item)
    return true
  })

  const excludedCount = order.items.filter(item => {
    if (stationMode === 'kitchen') return isDrinkItem(item)
    if (stationMode === 'bar') return !isDrinkItem(item)
    return false
  }).reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 rounded-2xl hover:scale-[1.01] hover:shadow-xl ${borderStyle}`}>
      <CardHeader className={`flex flex-row justify-between items-center py-4 px-5 border-b ${headerBg}`}>
        <div>
          <CardTitle className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            Ticket #{order.id}
          </CardTitle>
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
            {order.type === 'dine_in' ? '🍽️ Dine-in' : '📦 Takeaway'} • {order.table_number}
          </span>
        </div>
        
        <Badge className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
          order.status === 'pending' 
            ? 'bg-amber-50 text-amber-750 border border-amber-200 dark:bg-amber-950/25 dark:text-amber-400' 
            : 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/25 dark:text-sky-400'
        }`}>
          {order.status === 'pending' ? 'NEW' : 'COOKING'}
        </Badge>
      </CardHeader>

      <CardContent className="p-5">
        {/* List of items */}
        <ul className="space-y-3 pb-4 border-b border-dashed border-border min-h-[100px]">
          {displayedItems.map((item) => {
            const isChecked = checkedItems[`${order.id}-${item.id}`]
            return (
              <li 
                key={item.id} 
                onClick={() => toggleItemChecked(order.id, item.id)}
                className={`flex justify-between items-start cursor-pointer group select-none p-1.5 rounded-lg transition-colors duration-150 ${
                  isChecked ? 'bg-muted/20' : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 pr-2">
                  <div className="mt-0.5 text-muted-foreground group-hover:text-amber-650 transition-colors flex-shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <span className={`font-extrabold text-base mr-2 transition-all ${
                      isChecked ? 'line-through text-muted-foreground/50 opacity-50' : 'text-foreground'
                    }`}>
                      {item.quantity}x
                    </span>
                    <span className={`font-semibold text-sm transition-all ${
                      isChecked ? 'line-through text-muted-foreground/50 opacity-50' : 'text-foreground'
                    }`}>
                      {item.product_name}
                    </span>
                    <span className={`text-xs block transition-all ${
                      isChecked ? 'text-muted-foreground/30 opacity-40' : 'text-muted-foreground'
                    }`}>
                      Size: {item.variant_name}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Excluded items notice */}
        {excludedCount > 0 && (
          <div className="mt-2.5 px-3 py-2 bg-muted/30 border border-border rounded-xl flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 text-muted-foreground">
              {stationMode === 'kitchen' ? (
                <>
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  {excludedCount} Drink{excludedCount > 1 ? 's' : ''} at Cashier/Bar
                </>
              ) : (
                <>
                  <ChefHat className="w-3.5 h-3.5 text-sky-600" />
                  {excludedCount} Food Item{excludedCount > 1 ? 's' : ''} in Kitchen
                </>
              )}
            </span>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 text-[9px] font-black uppercase py-0.5 px-1.5 rounded">
              Direct
            </Badge>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-4 flex items-center justify-between">
          {/* Elapsed Timer */}
          <div className={`flex items-center gap-1.5 text-xs font-bold ${
            isUrgent ? 'text-rose-600 animate-pulse' : isWarning ? 'text-amber-600' : 'text-muted-foreground'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            <span>{elapsed}</span>
            {isUrgent && (
              <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded text-[9px] uppercase tracking-wide text-rose-700">
                Overdue
              </span>
            )}
          </div>

          {order.status === 'pending' ? (
            <Button 
              size="sm" 
              onClick={() => updateStatus(order.id, 'cooking')}
              className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl px-4 py-2"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
              Start Cooking
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => updateStatus(order.id, 'ready')}
              className="gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl px-4 py-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
