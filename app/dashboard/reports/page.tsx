"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import api from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

interface DailySales {
    date: string;
    revenue: number;
}

interface TopProduct {
    name: string;
    total_qty: number;
}

interface AnalyticsData {
    daily_sales: DailySales[];
    top_products: TopProduct[];
}

export default function ReportsPage() {
    const [data, setData] = React.useState<AnalyticsData>({ daily_sales: [], top_products: [] })

    const fetchAnalytics = React.useCallback(async () => {
        try {
            const res = await api.get("/reports/dashboard")
            setData(res.data)
        } catch {
            toast.error("Failed to load analytics")
        }
    }, [])

    React.useEffect(() => {
        queueMicrotask(() => {
            fetchAnalytics()
        })
    }, [fetchAnalytics])

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Cafe Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Daily Revenue (Last 7 Days)</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.daily_sales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.top_products}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total_qty" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
