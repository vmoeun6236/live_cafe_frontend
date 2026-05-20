"use client"

import React from "react"
import { Order } from "./types"
import { isDrinkItem } from "./utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, CheckCircle2, RotateCcw } from "lucide-react"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  completedOrders: Order[]
  stationMode: 'kitchen' | 'bar' | 'all'
  updateStatus: (id: number, status: string, message?: string) => void
}

export function HistoryModal({
  isOpen,
  onClose,
  completedOrders,
  stationMode,
  updateStatus
}: HistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm transition duration-300">
      <div className="w-full max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Recently Completed
            </h2>
            <p className="text-xs text-muted-foreground">Recall orders back to range if completed by mistake</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>

        {/* Completed Tickets List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {completedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold">No tickets cleared recently</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div 
                key={order.id} 
                className="p-4 bg-card border border-border rounded-xl flex justify-between items-center hover:bg-muted/40 transition duration-150"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">Ticket #{order.id}</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px]">
                      READY
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Table: {order.table_number} • {order.items.filter(i => {
                      if (stationMode === 'kitchen') return !isDrinkItem(i)
                      if (stationMode === 'bar') return isDrinkItem(i)
                      return true
                    }).reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateStatus(order.id, 'cooking', `Order #${order.id} recalled successfully!`)
                    onClose()
                  }}
                  className="gap-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted"
                  title="Recall back to display"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recall
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-border mt-6 text-center text-xs text-muted-foreground">
          Orders already served or paid cannot be recalled.
        </div>
      </div>
    </div>
  )
}
