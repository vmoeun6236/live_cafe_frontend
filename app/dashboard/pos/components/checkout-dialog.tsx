"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UtensilsIcon, PackageIcon, BanknoteIcon, CreditCardIcon, QrCode, Loader2Icon, Layers } from "lucide-react"
import { DynamicKHQR } from "./dynamic-khqr"
import { CafeTable } from "./types"

interface CheckoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderType: "dine_in" | "takeaway"
    setOrderType: (v: "dine_in" | "takeaway") => void
    selectedTable: number | null
    setSelectedTable: (v: number | null) => void
    tables: CafeTable[]
    paymentMethod: "cash" | "card" | "khqr"
    setPaymentMethod: (v: "cash" | "card" | "khqr") => void
    cashAmount: string
    setCashAmount: (v: string) => void
    gateways: any[]
    selectedGateway: string
    setSelectedGateway: (v: string) => void
    printAfterCheckout: boolean
    setPrintAfterCheckout: (v: boolean) => void
    total: number
    subtotal: number
    tax: number
    discount: number
    suggestedAmounts: number[]
    processingOrder: boolean
    handleCheckout: () => void
    qrContainerRef: React.RefObject<HTMLDivElement | null>
}

export function CheckoutDialog({
    open,
    onOpenChange,
    orderType,
    setOrderType,
    selectedTable,
    setSelectedTable,
    tables,
    paymentMethod,
    setPaymentMethod,
    cashAmount,
    setCashAmount,
    gateways,
    selectedGateway,
    setSelectedGateway,
    printAfterCheckout,
    setPrintAfterCheckout,
    total,
    subtotal,
    tax,
    discount,
    suggestedAmounts,
    processingOrder,
    handleCheckout,
    qrContainerRef
}: CheckoutDialogProps) {
    const [activeFloor, setActiveFloor] = React.useState<number>(1)
    
    // Group tables by floor
    const floors = React.useMemo(() => {
        const floorMap = new Map<number, CafeTable[]>()
        tables.filter(t => t.status === 'available').forEach(table => {
            const floor = (table as any).floor ?? 1
            if (!floorMap.has(floor)) floorMap.set(floor, [])
            floorMap.get(floor)?.push(table)
        })
        return Array.from(floorMap.entries()).sort((a, b) => a[0] - b[0])
    }, [tables])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Complete Order</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                    <div className="space-y-4 pb-2">
                        <div className="space-y-2">
                            <Label>Order Type</Label>
                            <RadioGroup value={orderType} onValueChange={(v: "dine_in" | "takeaway") => {
                                setOrderType(v)
                                if (v === "takeaway") setSelectedTable(null)
                            }}>
                                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                    <RadioGroupItem value="dine_in" id="dine_in" />
                                    <Label htmlFor="dine_in" className="flex-1 cursor-pointer flex items-center gap-2">
                                        <UtensilsIcon className="size-4" />
                                        Dine In
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                    <RadioGroupItem value="takeaway" id="takeaway" />
                                    <Label htmlFor="takeaway" className="flex-1 cursor-pointer flex items-center gap-2">
                                        <PackageIcon className="size-4" />
                                        Takeaway
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Table Selection for Dine-In with Floor Switcher */}
                        {orderType === "dine_in" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Select Table {!selectedTable && <span className="text-destructive">*</span>}</Label>
                                    <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl">
                                        {floors.map(([floorNumber]) => (
                                            <Button
                                                key={floorNumber}
                                                size="sm"
                                                variant={activeFloor === floorNumber ? "default" : "ghost"}
                                                onClick={() => setActiveFloor(floorNumber)}
                                                className="h-8 text-xs font-semibold rounded-lg"
                                            >
                                                Floor {floorNumber}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <ScrollArea className="h-40 border border-border rounded-xl p-3 bg-muted/10">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {floors.find(f => f[0] === activeFloor)?.[1].map(table => (
                                            <Button
                                                key={table.id}
                                                variant={selectedTable === table.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedTable(table.id)}
                                                className="h-16 flex flex-col justify-center items-center rounded-xl p-2 transition-all duration-150"
                                            >
                                                <span className="font-extrabold text-sm">
                                                    {table.number.toLowerCase().includes("table") ? table.number : `Table ${table.number}`}
                                                </span>
                                                <span className={`text-[10px] font-semibold ${selectedTable === table.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                    {table.capacity} seats
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                    {!floors.find(f => f[0] === activeFloor) && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No tables available on this floor
                                        </p>
                                    )}
                                </ScrollArea>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(v: "cash" | "card" | "khqr" | "pending") => {
                                setPaymentMethod(v)
                                if (v !== "cash") setCashAmount("")
                            }}>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="cash" id="cash" />
                                        <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
                                            <BanknoteIcon className="size-3.5 text-green-600 animate-pulse" />
                                            Cash
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="card" id="card" />
                                        <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
                                            <CreditCardIcon className="size-3.5 text-blue-600" />
                                            Card
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="khqr" id="khqr" />
                                        <Label htmlFor="khqr" className="flex-1 cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
                                            <QrCode className="size-3.5 text-[#6F1D2C]" />
                                            KHQR
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                        <RadioGroupItem value="pending" id="pending" />
                                        <Label htmlFor="pending" className="flex-1 cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
                                            <Loader2Icon className="size-3.5 text-amber-600" />
                                            Pending
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Card Payment Gateways / Simulation */}
                        {paymentMethod === "card" && (
                            <div className="space-y-2">
                                <Label>Select Card Terminal/Gateway</Label>
                                {gateways.filter(g => g.provider !== 'khqr').length > 0 ? (
                                    <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
                                        {gateways.filter(g => g.provider !== 'khqr').map((gateway) => (
                                            <div
                                                key={gateway.id}
                                                className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                                            >
                                                <RadioGroupItem value={gateway.id.toString()} id={`gateway-${gateway.id}`} />
                                                <Label htmlFor={`gateway-${gateway.id}`} className="flex-1 cursor-pointer flex items-center justify-between">
                                                    <span className="font-semibold">{gateway.name}</span>
                                                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 capitalize">
                                                        {gateway.provider} ({gateway.currency})
                                                    </Badge>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <div className="border rounded-lg p-4 bg-muted/40 text-center space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium">
                                            No active card payment gateways configured.
                                        </p>
                                        <p className="text-xs font-semibold text-primary">
                                            Using Terminal Simulator mode.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* KHQR payment gateways / Simulation */}
                        {paymentMethod === "khqr" && (
                            <div ref={qrContainerRef} className="border rounded-xl p-4 bg-[#6F1D2C]/10 border-[#6F1D2C]/20 text-center space-y-3">
                                <div className="max-w-[240px] mx-auto bg-gradient-to-br from-[#0B2545] to-[#134074] text-white rounded-xl p-4 shadow-lg border border-white/10 space-y-3 relative overflow-hidden">
                                    <div className="absolute -top-12 -right-12 size-24 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                                        <span>KHQR / ABA Pay</span>
                                        <Badge className="bg-[#6F1D2C] hover:bg-[#6F1D2C]/90 text-white font-extrabold text-[9px] border-none px-2 py-0.5 rounded">
                                            LIVE CAFE
                                        </Badge>
                                    </div>
                                    <DynamicKHQR total={total} gateways={gateways} />
                                    <div className="space-y-1">
                                        <div className="text-sm font-extrabold tracking-wide text-white flex items-center justify-center gap-1">
                                            <span>${total.toFixed(2)}</span>
                                            <span className="text-cyan-300 font-semibold text-xs">/ {(total * 4000).toLocaleString()} ៛</span>
                                        </div>
                                        <div className="text-[10px] text-white/70 font-mono">
                                            Order ID: #{Math.floor(Math.random() * 1000) + 9000}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-[#6F1D2C] flex items-center justify-center gap-1.5 animate-pulse">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F1D2C] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F1D2C]"></span>
                                        </span>
                                        Waiting for Customer Payment scan...
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        KHQR is dynamic. Once scanned and processed, the terminal will automatically trigger print-routing.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Cash Amount Input */}
                        {paymentMethod === "cash" && (
                            <div className="space-y-2">
                                <Label htmlFor="cash-amount">Cash Amount {!cashAmount && <span className="text-destructive">*</span>}</Label>
                                <Input
                                    id="cash-amount"
                                    type="number"
                                    step="0.01"
                                    min={total}
                                    placeholder={`Min: $${total.toFixed(2)}`}
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    className="text-lg font-semibold"
                                />
                                {/* Quick Amount Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    {suggestedAmounts.map(amount => (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCashAmount(amount.toString())}
                                            className="flex-1"
                                        >
                                            ${amount}
                                        </Button>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCashAmount(total.toFixed(2))}
                                        className="flex-1"
                                    >
                                        Exact
                                    </Button>
                                </div>
                                {cashAmount && parseFloat(cashAmount) >= total && (
                                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Change:</span>
                                        <span className="text-lg font-bold text-green-700 dark:text-green-300">
                                            ${(parseFloat(cashAmount) - total).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between border border-border rounded-xl p-3 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setPrintAfterCheckout(!printAfterCheckout)}>
                            <div className="flex items-center gap-2.5">
                                <input 
                                    type="checkbox" 
                                    id="print-receipt" 
                                    checked={printAfterCheckout} 
                                    onChange={(e) => {
                                        e.stopPropagation()
                                        setPrintAfterCheckout(e.target.checked)
                                    }}
                                    className="size-4 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor="print-receipt" className="cursor-pointer font-bold text-sm text-foreground" onClick={(e) => e.stopPropagation()}>
                                    Print Receipt Automatically
                                </Label>
                            </div>
                            <span className="text-[10px] bg-primary/15 text-primary uppercase font-extrabold px-2 py-0.5 rounded-md tracking-wider">
                                Thermal
                            </span>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processingOrder}>
                        Cancel
                    </Button>
                    <Button onClick={handleCheckout} disabled={processingOrder}>
                        {processingOrder ? (
                            <>
                                <Loader2Icon className="size-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCardIcon className="size-4 mr-2" />
                                Confirm Payment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
