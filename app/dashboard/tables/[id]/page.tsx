"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { 
  ArrowLeft, 
  QrCode, 
  Printer, 
  Table as TableIcon, 
  Clock, 
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CafeTable {
  id: number
  number: string
  capacity: number
  status: 'available' | 'occupied' | 'cleaning' | 'reserved'
}

interface Order {
  id: number
  total: string
  status: string
  created_at: string
}

export default function TableDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [table, setTable] = useState<CafeTable | null>(null)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // Resolve LAN IP from current browser origin to make the QR Code dynamic!
  const [lanUrl, setLanUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLanUrl(`${window.location.origin}/table/${id}`)
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      try {
        // 1. Fetch Table details
        const tableRes = await api.get(`/tables/${id}`)
        setTable(tableRes.data.data || tableRes.data)

        // 2. Fetch all orders and filter active ones for this table
        const ordersRes = await api.get("/orders")
        const allOrders = ordersRes.data.data || []
        const tableOrders = allOrders.filter(
          (o: any) => o.table_id === parseInt(id as string) && !['completed', 'cancelled', 'paid'].includes(o.status)
        )
        setActiveOrders(tableOrders)
      } catch (err) {
        console.error("Failed to load table details:", err)
        toast.error("Failed to load table details")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const printQrCode = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(lanUrl)}`

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${table?.number || id}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              text-align: center;
              background-color: #ffffff;
              color: #000000;
              margin: 0;
            }
            .card {
              border: 3px solid #000;
              padding: 40px;
              border-radius: 24px;
              max-width: 450px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .title {
              font-size: 32px;
              font-weight: 900;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 16px;
              color: #555;
              margin-bottom: 25px;
            }
            .qr-container {
              padding: 15px;
              border: 2px solid #ddd;
              border-radius: 16px;
              display: inline-block;
              background: #fff;
              margin-bottom: 20px;
            }
            .instructions {
              font-size: 18px;
              font-weight: bold;
              margin-top: 15px;
              color: #222;
            }
            .url {
              font-size: 12px;
              color: #888;
              margin-top: 5px;
              word-break: break-all;
            }
            @media print {
              .no-print { display: none; }
              body { min-height: auto; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">☕ LIVE CAFE</div>
            <div class="subtitle">Self-Service QR Ordering</div>
            <div class="qr-container">
              <img src="${qrImgUrl}" width="280" height="280" alt="Table QR Code" />
            </div>
            <div class="title" style="font-size: 28px;">TABLE ${table?.number || id}</div>
            <div class="instructions">Scan to Browse Menu & Order</div>
            <div class="url">${lanUrl}</div>
          </div>
          <br/>
          <button class="no-print" onclick="window.print()" style="padding: 12px 24px; font-size: 16px; font-weight: bold; background: #f59e0b; border: none; border-radius: 8px; cursor: pointer; color: #000;">
            Print Now
          </button>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const updateTableStatus = async (status: string) => {
    try {
      await api.patch(`/tables/${id}/status`, { status })
      setTable(prev => prev ? { ...prev, status: status as any } : null)
      toast.success("Table status updated successfully")
    } catch {
      toast.error("Failed to update status")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground">Loading details for Table {id}...</p>
        </div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Table Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">The table you are trying to view does not exist.</p>
        <Button onClick={() => router.push("/dashboard/tables")}>
          Back to Tables
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push("/dashboard/tables")}
          title="Back to tables list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table {table.number} Detail</h1>
          <p className="text-sm text-muted-foreground">
            Manage QR codes and view active orders for this table
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Card */}
        <Card className="lg:col-span-5 relative overflow-hidden border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-500" />
              Customer QR Ordering
            </CardTitle>
            <CardDescription>
              Print this QR code to place it physically on Table {table.number}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 border-t border-b">
            {/* Real Dynamic QR Code image utilizing browser host */}
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-900 shadow-xl mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(lanUrl)}`} 
                width="200" 
                height="200" 
                alt="Table QR Code"
              />
            </div>
            
            <Badge className="text-sm bg-slate-900 text-amber-500 border border-amber-500/20 py-1.5 px-3 mb-2 rounded-xl select-all font-mono">
              Table {table.number} URL
            </Badge>
            <p className="text-xs text-muted-foreground text-center break-all select-all font-medium px-4">
              {lanUrl}
            </p>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center py-4 bg-muted/30">
            <Button onClick={printQrCode} className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
              <Printer className="h-4 w-4 stroke-[2.5]" />
              Print QR Sign
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(lanUrl, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Customer View
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: Seating details & orders */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" />
                Table Status & Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Capacity</span>
                <span className="font-semibold">{table.capacity} Seats</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <Badge className={`capitalize py-1 px-3 ${
                  table.status === 'available' ? 'bg-green-500 text-white' :
                  table.status === 'occupied' ? 'bg-red-500 text-white' :
                  table.status === 'cleaning' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {table.status}
                </Badge>
              </div>

              <div className="pt-2">
                <span className="text-sm font-medium block mb-2 text-muted-foreground">Change Table Status</span>
                <div className="flex flex-wrap gap-2">
                  {['available', 'occupied', 'cleaning', 'reserved'].map((s) => (
                    <Button 
                      key={s}
                      variant={table.status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateTableStatus(s)}
                      className="capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Panel */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Active Kitchen Orders
              </CardTitle>
              <CardDescription>
                Orders currently placed by Table {table.number} that are not finalized
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              {activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <CheckCircle className="h-10 w-10 text-green-500/40 mb-2" />
                  <p className="text-sm font-medium">No active kitchen orders</p>
                  <p className="text-xs">Any new self-service orders placed will show up here.</p>
                </div>
              ) : (
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {activeOrders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center p-4 hover:bg-muted/40 transition">
                      <div>
                        <span className="font-bold text-sm">Order #{o.id}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <Badge variant="outline" className="text-xs capitalize py-0 px-2">
                            {o.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-amber-500">${parseFloat(o.total).toFixed(2)}</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => router.push(`/dashboard/orders?id=${o.id}`)}
                          className="block p-0 h-auto text-xs mt-1"
                        >
                          View Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
