'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, RefreshCw } from 'lucide-react'
import { ReportFilters, ReportPeriod, PERIOD_OPTIONS } from './types'

interface ReportFiltersBarProps {
    filters: ReportFilters
    loading: boolean
    onChange: (filters: ReportFilters) => void
    onRefresh: () => void
}

export function ReportFiltersBar({
    filters,
    loading,
    onChange,
    onRefresh,
}: ReportFiltersBarProps) {
    const setPeriod = (period: ReportPeriod) => {
        onChange({ ...filters, period })
    }

    return (
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-card shadow-sm">
            {/* Period toggle buttons */}
            <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Period
                </Label>
                <div className="flex rounded-lg overflow-hidden border">
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={[
                                'px-4 py-2 text-sm font-medium transition-colors focus:outline-none',
                                filters.period === opt.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background hover:bg-muted text-muted-foreground',
                            ].join(' ')}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom date range — only shown when period === 'custom' */}
            {filters.period === 'custom' && (
                <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="start-date" className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            From
                        </Label>
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="start-date"
                                type="date"
                                className="pl-8 w-40"
                                value={filters.startDate}
                                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="end-date" className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            To
                        </Label>
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="end-date"
                                type="date"
                                className="pl-8 w-40"
                                value={filters.endDate}
                                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Refresh */}
            <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="ml-auto self-end"
            >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading…' : 'Refresh'}
            </Button>
        </div>
    )
}
