"use client"

import * as React from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { calculateCRC16 } from "./utils"

interface DynamicKHQRProps {
    total: number
    gateways: any[]
}

export function DynamicKHQR({ total, gateways }: DynamicKHQRProps) {
    const [currency, setCurrency] = React.useState<"USD" | "KHR">("USD")
    const [qrUrl, setQrUrl] = React.useState<string>("")

    React.useEffect(() => {
        // 1. Locate the active KHQR payment gateway
        const khqrGate = gateways.find(g => g.provider === "khqr" && g.status === "active")

        // 2. Parse configurations or fallback to default MAKARA HAM credentials
        const rawName = khqrGate?.name ? khqrGate.name : "MAKARA HAM"
        // Clean out any custom brackets or provider tags from name
        const merchantName = rawName.replace(/\(khqr\)/i, '').trim().toUpperCase().substring(0, 25)
        const accountKHR = khqrGate?.api_key ? khqrGate.api_key.replace(/\s+/g, '') : "008656861"
        const accountUSD = khqrGate?.api_secret ? khqrGate.api_secret.replace(/\s+/g, '') : "008656859"
        const city = "Phnom Penh"

        // 3. Dynamically assemble Tag 29 (Merchant Account Info - Bakong Account ID)
        const activeAccount = currency === "USD" ? accountUSD : accountKHR
        const bakongId = activeAccount.includes("@") ? activeAccount : `${activeAccount}@abaa`
        const sub29_00 = "00" + bakongId.length.toString().padStart(2, '0') + bakongId
        const tag29 = "29" + sub29_00.length.toString().padStart(2, '0') + sub29_00

        // 5. Build dynamic merchant name and city tags
        const tag59 = "59" + merchantName.length.toString().padStart(2, '0') + merchantName
        const tag60 = "60" + city.length.toString().padStart(2, '0') + city

        // 6. Dynamic Amount and Currency Tag Construction
        let amountStr = ""
        let currencyCode = "840" // USD
        if (currency === "USD") {
            amountStr = total.toFixed(2)
            currencyCode = "840"
        } else {
            amountStr = Math.round(total * 4000).toString()
            currencyCode = "116" // KHR Riel
        }
        const tag54 = "54" + amountStr.length.toString().padStart(2, '0') + amountStr
        const tag53 = "5303" + currencyCode

        // 7. Concatenate and calculate CRC-16 CCITT
        const base = "000201010212" + tag29 + "52045999" + tag53 + tag54 + "5802KH" + tag59 + tag60 + "6304"
        const crc = calculateCRC16(base)
        const qrString = base + crc

        QRCode.toDataURL(qrString, {
            margin: 1,
            width: 256,
            color: {
                dark: "#0B2545",
                light: "#FFFFFF"
            }
        }).then(url => {
            setQrUrl(url)
        }).catch(err => {
            console.error("QR Code generation failed:", err)
        })
    }, [total, currency, gateways])

    return (
        <div className="space-y-3">
            {/* Currency Selector Tabs */}
            <div className="flex justify-center gap-1.5 p-1 bg-white/10 rounded-lg max-w-[180px] mx-auto">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrency("USD")}
                    className={`flex-1 py-0.5 h-6 text-[10px] font-extrabold rounded transition-all ${currency === "USD" ? "bg-white text-[#0B2545] shadow" : "text-white hover:bg-white/10"}`}
                >
                    USD ($)
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrency("KHR")}
                    className={`flex-1 py-0.5 h-6 text-[10px] font-extrabold rounded transition-all ${currency === "KHR" ? "bg-white text-[#0B2545] shadow" : "text-white hover:bg-white/10"}`}
                >
                    KHR (៛)
                </Button>
            </div>

            {/* QR display with ABA bank seal overlay */}
            <div className="relative size-36 mx-auto bg-white rounded-lg p-2 flex items-center justify-center shadow-inner border border-[#0B2545]/10">
                {qrUrl ? (
                    <div className="relative w-full h-full">
                        <img src={qrUrl} alt="Dynamic ABA KHQR" className="w-full h-full object-contain" />
                        {/* Red bank seal overlay in center of QR */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 bg-white rounded-full p-0.5 shadow-md flex items-center justify-center pointer-events-none">
                            <div className="size-full bg-red-600 rounded-full flex items-center justify-center text-white font-extrabold text-[8px] tracking-wider leading-none shadow-sm">
                                ABA
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="size-full animate-pulse bg-muted rounded" />
                )}
            </div>
        </div>
    )
}
