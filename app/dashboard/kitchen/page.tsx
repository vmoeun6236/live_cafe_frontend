"use client"

import React, { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChefHat, 
  Clock, 
  Bell, 
  BellOff, 
  UtensilsCrossed,
  ShoppingBag,
  History,
  Loader2,
  Coffee
} from "lucide-react"

import { Order } from "./components/types"
import { isDrinkItem } from "./components/utils"
import { OrderCard } from "./components/order-card"
import { HistoryModal } from "./components/history-modal"

export default function KitchenPage() {
  const [stationMode, setStationMode] = useState<'kitchen' | 'bar' | 'all'>('kitchen')
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [allCompletedOrders, setAllCompletedOrders] = useState<Order[]>([])
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [previousOrderIds, setPreviousOrderIds] = useState<Set<number>>(new Set())

  // Web Audio API Programmatic Cafe Bell Chime
  const playDingDong = useCallback(() => {
    if (!soundEnabled) return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = new AudioContext()
      
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, ctx.currentTime)
      gain1.gain.setValueAtTime(0.2, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.6)
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime)
        gain2.gain.setValueAtTime(0.2, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 1.0)
      }, 180)
    } catch (e) {
      console.warn("Audio chime blocked or not supported:", e)
    }
  }, [soundEnabled])

  // Programmatic Click Chime for checklists
  const playTickTone = useCallback(() => {
    if (!soundEnabled) return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1100, ctx.currentTime)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch (e) {}
  }, [soundEnabled])

  // Fetch kitchen orders
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const res = await api.get("/orders")
      const data = res.data.data || []
      
      const active = data.filter((o: Order) => ['pending', 'cooking', 'served'].includes(o.status))
      const completed = data.filter((o: Order) => o.status === 'ready')

      setAllOrders(active)
      setAllCompletedOrders(completed)

      // Audio notification check
      if (!isInitial && active.length > 0) {
        const currentIds = new Set<number>(active.map((o: Order) => o.id))
        let hasNewOrder = false
        for (const id of currentIds) {
          if (!previousOrderIds.has(id)) {
            hasNewOrder = true
            break
          }
        }

        if (hasNewOrder) {
          playDingDong()
          toast.success("🛎️ New Order Received!", {
            duration: 4000,
            icon: '🛎️',
            style: {
              background: '#0f172a',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }
          })
        }

        setPreviousOrderIds(currentIds)
      } else if (isInitial) {
        const initialIds = new Set<number>(active.map((o: Order) => o.id))
        setPreviousOrderIds(initialIds)
      }
    } catch (error) {
      console.error("Failed to load kitchen orders:", error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [previousOrderIds, playDingDong])

  // Initial load
  useEffect(() => {
    fetchOrders(true)
  }, [])

  // Fast optimized polling loop
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 4000)

    return () => clearInterval(interval)
  }, [fetchOrders])

  // Filter orders based on stationMode
  const filteredActiveOrders = React.useMemo(() => {
    return allOrders.filter((o) => {
      if (stationMode === 'kitchen') {
        return o.items.some(item => !isDrinkItem(item))
      } else if (stationMode === 'bar') {
        return o.items.some(item => isDrinkItem(item))
      }
      return true
    })
  }, [allOrders, stationMode])

  const filteredCompletedHistory = React.useMemo(() => {
    return allCompletedOrders.filter((o) => {
      if (stationMode === 'kitchen') {
        return o.items.some(item => !isDrinkItem(item))
      } else if (stationMode === 'bar') {
        return o.items.some(item => isDrinkItem(item))
      }
      return true
    })
  }, [allCompletedOrders, stationMode])

  // Update order status
  const updateStatus = async (id: number, status: string, message?: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      toast.success(message || (status === 'ready' ? "Order marked as Ready!" : "Started cooking order!"))
      
      setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o))
      
      if (status === 'ready') {
        setAllOrders(prev => prev.filter(o => o.id !== id))
        setPreviousOrderIds(prev => {
          const updated = new Set(prev)
          updated.delete(id)
          return updated
        })
      }
      
      fetchOrders()
    } catch {
      toast.error("Failed to update status")
    }
  }

  // Toggle item checkboxes
  const toggleItemChecked = (orderId: number, itemId: number) => {
    const key = `${orderId}-${itemId}`
    setCheckedItems(prev => {
      const isChecking = !prev[key]
      if (isChecking) {
        playTickTone()
      }
      return { ...prev, [key]: isChecking }
    })
  }

  return (
    <>
      <title>Kitchen Display (KDS)</title>
      <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 bg-background min-h-screen text-foreground">
        {/* Title & Status Summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              🍳 Kitchen Display System (KDS)
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time active order preparations and ticket checklists
            </p>
          </div>

          {/* Action controllers */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`gap-2 font-bold px-3.5 rounded-xl border border-border ${
                soundEnabled 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-250' 
                  : 'bg-background hover:bg-muted text-muted-foreground'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  Chime On
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  Chime Muted
                </>
              )}
            </Button>

            {/* History Button (Recall completed items) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="rounded-xl bg-background hover:bg-muted border border-border text-foreground gap-2 font-semibold"
            >
              <History className="w-4 h-4" />
              History / Recall
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchOrders(true)}
              className="rounded-xl bg-background hover:bg-muted border border-border text-foreground"
            >
              Force Sync
            </Button>
          </div>
        </div>

        {/* Station Mode Toggle Tabs */}
        <div className="flex flex-wrap bg-muted/50 p-1.5 rounded-2xl border w-fit gap-2">
          <Button
            variant={stationMode === 'kitchen' ? 'default' : 'ghost'}
            onClick={() => setStationMode('kitchen')}
            className={`rounded-xl font-extrabold gap-2 px-6 py-2.5 transition-all ${
              stationMode === 'kitchen' 
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow' 
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Kitchen Station (Food Only)
          </Button>
          <Button
            variant={stationMode === 'bar' ? 'default' : 'ghost'}
            onClick={() => setStationMode('bar')}
            className={`rounded-xl font-extrabold gap-2 px-6 py-2.5 transition-all ${
              stationMode === 'bar' 
                ? 'bg-amber-500 hover:bg-amber-655 text-slate-950 shadow' 
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Bar Station (Drinks Only)
          </Button>
          <Button
            variant={stationMode === 'all' ? 'default' : 'ghost'}
            onClick={() => setStationMode('all')}
            className={`rounded-xl font-extrabold gap-2 px-6 py-2.5 transition-all ${
              stationMode === 'all' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow' 
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            All Stations
          </Button>
        </div>

        {/* Analytics widgets row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-muted rounded-xl text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Active</span>
              <span className="text-2xl font-black text-foreground">{filteredActiveOrders.length} Tickets</span>
            </div>
          </Card>

          <Card className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Queue (New)</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{filteredActiveOrders.filter(o => o.status === 'pending').length} Tickets</span>
            </div>
          </Card>

          <Card className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-sky-50 rounded-xl text-sky-600 dark:bg-sky-950/20 dark:text-sky-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">On Range (Cooking)</span>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{filteredActiveOrders.filter(o => o.status === 'cooking').length} Tickets</span>
            </div>
          </Card>
        </div>

        {/* Main tickets boards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p className="text-sm">Connecting to KDS database...</p>
          </div>
        ) : filteredActiveOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-3xl bg-muted/20">
            <UtensilsCrossed className="w-16 h-16 opacity-30 mb-4 animate-bounce text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground mb-1">Queue Clear!</h3>
            <p className="text-xs text-muted-foreground max-w-xs text-center">
              No active tickets currently pending for this station mode.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredActiveOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                stationMode={stationMode}
                checkedItems={checkedItems}
                toggleItemChecked={toggleItemChecked}
                updateStatus={updateStatus}
              />
            ))}
          </div>
        )}

        {/* History / Recall Modal Drawer */}
        <HistoryModal 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          completedOrders={filteredCompletedHistory}
          stationMode={stationMode}
          updateStatus={updateStatus}
        />
      </div>
    </>
  )
}
