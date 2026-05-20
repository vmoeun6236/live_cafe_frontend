"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckIcon, PrinterIcon } from "lucide-react"
import { printReceipt } from "./utils"

interface SuccessDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    successOrder: any
    onNewOrder: () => void
}

export function SuccessDialog({ open, onOpenChange, successOrder, onNewOrder }: SuccessDialogProps) {
    if (!successOrder) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] rounded-3xl p-6 bg-gradient-to-br from-background to-muted/30">
                <DialogHeader className="text-center">
                    <div className="mx-auto size-16 bg-green-500/10 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <CheckIcon className="size-8" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center text-green-600 dark:text-green-500">Order Completed!</DialogTitle>
                    <DialogDescription className="text-center font-medium">
                        Order #{successOrder?.id} was created successfully
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Summary Details */}
                    <div className="border border-border bg-background rounded-2xl p-4 space-y-2.5 shadow-sm text-sm">
                        <div className="flex justify-between font-bold">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="capitalize">{successOrder.type === 'dine_in' ? 'Dine In' : 'Takeaway'}</span>
                        </div>
                        {successOrder.table_number && (
                            <div className="flex justify-between font-bold">
                                <span className="text-muted-foreground">Table:</span>
                                <span>{successOrder.table_number}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span className="uppercase text-primary">{successOrder.payment_method}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                            <span className="text-muted-foreground">Total USD:</span>
                            <span className="text-base text-primary">${successOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs text-muted-foreground">
                            <span>Total KHR:</span>
                            <span>{(successOrder.total * 4000).toLocaleString()} ៛</span>
                        </div>
                    </div>

                    {/* KHQR scan box on screen */}
                    {successOrder.payment_method === 'khqr' && successOrder.qr_code_url && (
                        <div className="border rounded-2xl p-4 bg-gradient-to-b from-[#6F1D2C]/5 to-[#6F1D2C]/10 border-[#6F1D2C]/10 text-center space-y-3 relative overflow-hidden">
                            <p className="text-xs font-bold text-[#6F1D2C] uppercase tracking-wider">Customer Scan to Pay</p>
                            <div className="relative size-36 mx-auto bg-white rounded-xl p-2.5 flex items-center justify-center shadow-lg border border-[#0B2545]/15">
                                <div className="relative w-full h-full">
                                    <img src={successOrder.qr_code_url} alt="Dynamic ABA KHQR" className="w-full h-full object-contain" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center pointer-events-none">
                                        <div className="size-full bg-red-600 rounded-full flex items-center justify-center text-white font-extrabold text-[8px] tracking-wider leading-none shadow-sm">
                                            ABA
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Amount KHR: {(successOrder.total * 4000).toLocaleString()} ៛
                            </p>
                        </div>
                    )}

                    {/* Cash change box on screen */}
                    {successOrder.payment_method === 'cash' && (
                        <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-4 space-y-2 text-center">
                            <p className="text-xs text-muted-foreground font-medium">Cash Received: ${successOrder.paid_amount.toFixed(2)}</p>
                            <div className="text-sm font-medium text-green-700 dark:text-green-300">Change Due:</div>
                            <div className="text-3xl font-black text-green-600 dark:text-green-500">
                                ${successOrder.change.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground font-bold">
                                {(successOrder.change * 4000).toLocaleString()} ៛
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-muted-foreground/20"
                            onClick={() => printReceipt(successOrder, successOrder.change, 'cashier')}
                        >
                            <PrinterIcon className="size-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 h-11 rounded-xl font-bold shadow-md shadow-primary/25"
                            onClick={onNewOrder}
                        >
                            New Order
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
