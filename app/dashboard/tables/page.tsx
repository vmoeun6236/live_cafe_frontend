"use client"

import * as React from "react"
import Link from "next/link"
import api from "@/lib/axios"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LoaderIcon, TableIcon, PlusIcon, Trash2Icon, Layers } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"

interface CafeTable {
    id: number
    number: string
    capacity: number
    floor?: number
    status: 'available' | 'occupied' | 'cleaning' | 'reserved'
}

const statusColors: Record<CafeTable['status'], string> = {
    available: "bg-green-500 hover:bg-green-600 text-white",
    occupied: "bg-red-500 hover:bg-red-600 text-white",
    cleaning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    reserved: "bg-blue-500 hover:bg-blue-600 text-white",
}

const statusLabels: Record<CafeTable['status'], string> = {
    available: "Available",
    occupied: "Occupied",
    cleaning: "Cleaning",
    reserved: "Reserved",
}

export default function TablesPage() {
    const { hasPermission } = usePermissions()
    const [tables, setTables] = React.useState<CafeTable[]>([])
    const [loading, setLoading] = React.useState(true)
    const [createOpen, setCreateOpen] = React.useState(false)
    const [tableNumber, setTableNumber] = React.useState("")
    const [capacity, setCapacity] = React.useState("")
    const [floor, setFloor] = React.useState<string>("1")
    const [activeFloor, setActiveFloor] = React.useState<number>(1)
    const [creating, setCreating] = React.useState(false)

    const fetchTables = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get("/tables")
            setTables(res.data.data || [])
        } catch (error) {
            console.error("Failed to load tables:", error)
            toast.error("Failed to load tables")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        queueMicrotask(() => {
            fetchTables()
        })
    }, [fetchTables])

    async function updateStatus(id: number, status: string) {
        try {
            await api.patch(`/tables/${id}/status`, { status })
            await fetchTables()
            toast.success("Table status updated")
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to update status";
            toast.error(errorMsg)
        }
    }

    async function createTable() {
        if (!tableNumber || !capacity) {
            toast.error("Please fill all fields")
            return
        }

        setCreating(true)
        try {
            await api.post("/tables", {
                number: tableNumber,
                capacity: parseInt(capacity),
                floor: parseInt(floor)
            })
            toast.success("Table created successfully")
            setCreateOpen(false)
            setTableNumber("")
            setCapacity("")
            setFloor("1")
            await fetchTables()
        } catch (error: any) {
            const errorMsg = error.response?.data?.errors?.number?.[0] || 
                             error.response?.data?.message || 
                             "Failed to create table";
            toast.error(errorMsg)
        } finally {
            setCreating(false)
        }
    }

    async function deleteTable(id: number) {
        if (!confirm("Are you sure you want to delete this table?")) return

        try {
            await api.delete(`/tables/${id}`)
            toast.success("Table deleted")
            await fetchTables()
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to delete table";
            toast.error(errorMsg)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <LoaderIcon className="size-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading tables...</p>
                </div>
            </div>
        )
    }

    // Filter tables dynamically by selected floor level
    const filteredTables = tables.filter(t => (t.floor ?? 1) === activeFloor)

    return (
        <>
            <title>Seating Layouts</title>
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Restaurant Seating Map</h1>
                    <p className="text-muted-foreground">
                        Manage your cafe tables, floor layouts, and seating status
                    </p>
                </div>
                {hasPermission("create_table") && (
                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <PlusIcon className="size-4" />
                        Add Table
                    </Button>
                )}
            </div>

            {/* Premium Floor Switcher Tab Controls */}
            <div className="flex gap-2.5 border-b border-muted pb-3.5 mb-2 overflow-x-auto">
                <Button
                    variant={activeFloor === 1 ? "default" : "outline"}
                    onClick={() => setActiveFloor(1)}
                    className="rounded-xl font-black px-6 py-5 gap-2 flex items-center shadow-sm"
                >
                    <Layers className="w-4 h-4" />
                    Ground Floor (Floor 1)
                    <Badge className="ml-1 bg-slate-950 text-white border-none py-0.5 px-2 text-[10px]">
                        {tables.filter(t => (t.floor ?? 1) === 1).length}
                    </Badge>
                </Button>
                
                <Button
                    variant={activeFloor === 2 ? "default" : "outline"}
                    onClick={() => setActiveFloor(2)}
                    className="rounded-xl font-black px-6 py-5 gap-2 flex items-center shadow-sm"
                >
                    <Layers className="w-4 h-4 text-amber-500" />
                    Second Floor (Floor 2)
                    <Badge className="ml-1 bg-slate-950 text-white border-none py-0.5 px-2 text-[10px]">
                        {tables.filter(t => (t.floor ?? 1) === 2).length}
                    </Badge>
                </Button>
            </div>

            {/* Tables Grid */}
            {filteredTables.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-16 border-dashed border-2">
                    <TableIcon className="size-16 text-muted-foreground opacity-30 mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold mb-2">No tables placed on Floor {activeFloor}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm text-center mb-6">
                        Organize your dining space. Get started by adding the first seating layout on this level.
                    </p>
                    {hasPermission("create_table") && (
                        <Button onClick={() => setCreateOpen(true)} className="gap-2 font-bold rounded-xl px-5">
                            <PlusIcon className="size-4" />
                            Add Table on Floor {activeFloor}
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredTables.map(table => (
                        <Card key={table.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200">
                            <CardHeader className="pb-3 bg-muted/20">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                            <TableIcon className="size-5 text-primary animate-pulse" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold hover:text-amber-500 transition cursor-pointer">
                                                <Link href={`/dashboard/tables/${table.id}`}>
                                                    {table.number.toLowerCase().includes("table") ? table.number : `Table ${table.number}`}
                                                </Link>
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                                {table.capacity} Seats • Floor {table.floor ?? 1}
                                            </p>
                                        </div>
                                    </div>
                                    {hasPermission("delete_table") && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:bg-destructive/10 rounded-lg"
                                            onClick={() => deleteTable(table.id)}
                                        >
                                            <Trash2Icon className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3 pt-4 px-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Status:</span>
                                    <Badge className={`py-1 px-3 rounded-lg capitalize select-none font-bold ${statusColors[table.status]}`}>
                                        {statusLabels[table.status]}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 pt-3 px-5 pb-4 border-t bg-muted/5">
                                {hasPermission("manage_table_status") && (
                                    <>
                                        {table.status !== 'available' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-lg text-xs font-semibold py-1 h-8"
                                                onClick={() => updateStatus(table.id, 'available')}
                                            >
                                                Available
                                            </Button>
                                        )}
                                        {table.status !== 'occupied' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-lg text-xs font-semibold py-1 h-8 text-red-500 hover:text-red-650 hover:bg-red-50"
                                                onClick={() => updateStatus(table.id, 'occupied')}
                                            >
                                                Occupied
                                            </Button>
                                        )}
                                        {table.status !== 'cleaning' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-lg text-xs font-semibold py-1 h-8 text-yellow-600 hover:text-yellow-750 hover:bg-yellow-50"
                                                onClick={() => updateStatus(table.id, 'cleaning')}
                                            >
                                                Cleaning
                                            </Button>
                                        )}
                                        {table.status !== 'reserved' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 rounded-lg text-xs font-semibold py-1 h-8 text-blue-500 hover:text-blue-650 hover:bg-blue-50"
                                                onClick={() => updateStatus(table.id, 'reserved')}
                                            >
                                                Reserved
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Table Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="rounded-2xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Add New Table</DialogTitle>
                        <DialogDescription>
                            Create a new table layout for your restaurant floor seating
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="number" className="font-semibold">Table Name / Number</Label>
                            <Input
                                id="number"
                                placeholder="e.g., 1, A1, VIP-1"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity" className="font-semibold">Capacity (seats)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                placeholder="e.g., 4"
                                min="1"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="floor" className="font-semibold">Floor Level Location</Label>
                            <select
                                id="floor"
                                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                            >
                                <option value="1">Floor 1 (Ground Floor)</option>
                                <option value="2">Floor 2 (Second Floor)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(false)}
                            disabled={creating}
                            className="rounded-xl flex-1 sm:flex-initial"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={createTable} 
                            disabled={creating}
                            className="rounded-xl flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                        >
                            {creating && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                            Create Table
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </>
    )
}
