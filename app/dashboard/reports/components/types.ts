export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface PeriodOption {
    label: string
    value: ReportPeriod
}

export const PERIOD_OPTIONS: PeriodOption[] = [
    { label: 'Daily',   value: 'daily'   },
    { label: 'Weekly',  value: 'weekly'  },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom',  value: 'custom'  },
]

export interface ReportFilters {
    period: ReportPeriod
    startDate: string
    endDate: string
}

export interface SaleDataPoint {
    date: string
    revenue: number
    orders: number
}

export interface TopProduct {
    name: string
    total_qty: number
    total_revenue: number
}

export interface TopCategory {
    name: string
    total_qty: number
    total_revenue: number
}

export interface ReportSummary {
    total_revenue: number
    total_orders: number
    avg_order_value: number
    total_items_sold: number
}

export interface ReportData {
    summary: ReportSummary
    sales: SaleDataPoint[]
    top_products: TopProduct[]
    top_categories: TopCategory[]
}

export const EMPTY_REPORT: ReportData = {
    summary: {
        total_revenue: 0,
        total_orders: 0,
        avg_order_value: 0,
        total_items_sold: 0,
    },
    sales: [],
    top_products: [],
    top_categories: [],
}

/** Return ISO date string for today offset by `days` */
export function offsetDate(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
}

/** Format currency */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value)
}
