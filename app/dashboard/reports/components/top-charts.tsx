'use client'

import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TopProduct, TopCategory, formatCurrency } from './types'

// Vibrant palette for bars
const COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

function CustomTooltip({ active, payload, label, valueKey }: any) {
    if (!active || !payload?.length) return null
    const entry = payload[0]
    return (
        <div className="rounded-xl border bg-popover p-3 shadow-lg text-sm space-y-1">
            <p className="font-semibold text-foreground mb-1 truncate max-w-[160px]">{label}</p>
            <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium">{entry.payload.total_qty?.toLocaleString()}</span>
            </div>
            {entry.payload.total_revenue !== undefined && (
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full opacity-0" />
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{formatCurrency(entry.payload.total_revenue)}</span>
                </div>
            )}
        </div>
    )
}

// ── Top Products ──────────────────────────────────────────────────────────────

interface TopProductsChartProps {
    data: TopProduct[]
    loading: boolean
}

export function TopProductsChart({ data, loading }: TopProductsChartProps) {
    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
                <CardDescription>By quantity sold in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                        Loading…
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No product data
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={256}>
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="total_qty" radius={[0, 4, 4, 0]}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}

// ── Top Categories ────────────────────────────────────────────────────────────

interface TopCategoriesChartProps {
    data: TopCategory[]
    loading: boolean
}

export function TopCategoriesChart({ data, loading }: TopCategoriesChartProps) {
    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
                <CardDescription>Revenue by category in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">
                        Loading…
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No category data
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={256}>
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={110}
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
