'use client'

import {
    ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SaleDataPoint, ReportPeriod, formatCurrency } from './types'

interface RevenueChartProps {
    data: SaleDataPoint[]
    period: ReportPeriod
    loading: boolean
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
    daily:   'Today — Hourly Breakdown',
    weekly:  'This Week — Daily Breakdown',
    monthly: 'This Month — Daily Breakdown',
    custom:  'Custom Range — Daily Breakdown',
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border bg-popover p-3 shadow-lg text-sm space-y-1">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ background: entry.color }}
                    />
                    <span className="text-muted-foreground capitalize">{entry.name}:</span>
                    <span className="font-medium text-foreground">
                        {entry.name === 'revenue'
                            ? formatCurrency(entry.value)
                            : entry.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function RevenueChart({ data, period, loading }: RevenueChartProps) {
    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Revenue & Orders</CardTitle>
                <CardDescription>{PERIOD_LABELS[period]}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-72 flex items-center justify-center text-muted-foreground animate-pulse">
                        Loading chart data…
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-muted-foreground">
                        No data for the selected period
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={288}>
                        <ComposedChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="revenue"
                                orientation="left"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                yAxisId="orders"
                                orientation="right"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                            />
                            <Bar
                                yAxisId="revenue"
                                dataKey="revenue"
                                fill="url(#revenueGrad)"
                                radius={[4, 4, 0, 0]}
                                name="revenue"
                            />
                            <Line
                                yAxisId="orders"
                                type="monotone"
                                dataKey="orders"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#f59e0b' }}
                                activeDot={{ r: 5 }}
                                name="orders"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
