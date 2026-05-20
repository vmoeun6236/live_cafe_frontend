'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
    DollarSign, ShoppingCart, TrendingUp, Package,
} from 'lucide-react'
import { ReportSummary, formatCurrency } from './types'

interface StatsCardsProps {
    summary: ReportSummary
    loading: boolean
}

interface StatCard {
    label: string
    value: string
    icon: React.ElementType
    color: string
    bg: string
}

export function StatsCards({ summary, loading }: StatsCardsProps) {
    const cards: StatCard[] = [
        {
            label: 'Total Revenue',
            value: formatCurrency(summary.total_revenue),
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            label: 'Total Orders',
            value: summary.total_orders.toLocaleString(),
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            label: 'Avg Order Value',
            value: formatCurrency(summary.avg_order_value),
            icon: TrendingUp,
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
        },
        {
            label: 'Items Sold',
            value: summary.total_items_sold.toLocaleString(),
            icon: Package,
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-950/40',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.label} className="border shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {card.label}
                                    </p>
                                    <p className={`text-2xl font-bold tabular-nums ${loading ? 'opacity-40 animate-pulse' : ''}`}>
                                        {loading ? '—' : card.value}
                                    </p>
                                </div>
                                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
