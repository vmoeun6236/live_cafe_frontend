"use client"

import * as React from "react"
import Image from "next/image"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "react-hot-toast"
import { PlusIcon, PencilIcon, Trash2Icon, LoaderIcon, ImageIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api/client"
import { useProducts } from "@/hooks/use-products"
import { usePermissions } from "@/hooks/use-permissions"
import { getImageUrl } from "@/lib/utils"

import { Product, Category } from "./types"
import { ProductFormDialog } from "./product-form-dialog"
import { DeleteDialog } from "./delete-dialog"

function SafeImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
    const [error, setError] = React.useState(false)
    if (error || !src) {
        return (
            <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground/40">
                <ImageIcon className="size-6" />
            </div>
        )
    }
    return <Image src={src} alt={alt} fill className={className} onError={() => setError(true)} sizes="64px" />
}

export function ProductsTable() {
    const [mounted, setMounted] = React.useState(false)
    const { hasPermission } = usePermissions()
    const { data: products = [], isLoading: loading, refetch: fetchData } = useProducts()
    const [categories, setCategories] = React.useState<Category[]>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 50 })

    React.useEffect(() => {
        const filters: ColumnFiltersState = []
        if (categoryFilter !== "all") filters.push({ id: "category", value: categoryFilter })
        if (statusFilter !== "all") filters.push({ id: "status", value: statusFilter })
        setColumnFilters(filters)
    }, [categoryFilter, statusFilter])

    const [formOpen, setFormOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

    React.useEffect(() => { setMounted(true) }, [])

    React.useEffect(() => {
        api.get("/categories").then(res => setCategories(res.data.data ?? []))
    }, [])

    function openCreate() { setSelectedProduct(null); setFormOpen(true); }
    function openEdit(product: Product) { setSelectedProduct(product); setFormOpen(true); }
    function openDelete(product: Product) { setSelectedProduct(product); setDeleteOpen(true); }

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "image",
            header: "Image",
            enableSorting: false,
            cell: ({ row }) => (
                <div className="relative h-16 w-16 rounded-lg border overflow-hidden bg-muted">
                    <SafeImage src={getImageUrl(row.original.image)} alt={row.original.name} className="object-cover" />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Product",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base">{row.original.name}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                        {row.original.description || 'No description'}
                    </span>
                </div>
            ),
        },
        {
            id: "category",
            accessorFn: (row) => row.category?.id?.toString() || "uncategorized",
            header: "Category",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">{row.original.category?.name ?? 'Uncategorized'}</span>
                </div>
            ),
            filterFn: (row, id, value) => row.getValue(id) === value
        },
        {
            accessorKey: "variants",
            header: "Variants",
            enableSorting: false,
            cell: ({ row }) => {
                const variants = row.original.variants || []
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
                        {variants.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                ${Math.min(...variants.map(v => Number(v.price))).toFixed(2)} - ${Math.max(...variants.map(v => Number(v.price))).toFixed(2)}
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`} />
                        {status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission("update_product") && (
                        <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-lg opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity" onClick={() => openEdit(row.original)}>
                            <PencilIcon className="size-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                    )}
                    {hasPermission("delete_product") && (
                        <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity" onClick={() => openDelete(row.original)}>
                            <Trash2Icon className="size-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: products,
        columns,
        state: { sorting, columnFilters, columnVisibility, pagination, globalFilter },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: false, // Ensure this is false for client-side pagination
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-2xl border border-muted-foreground/10 shadow-sm">
                <div className="flex flex-1 items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 h-11 bg-background/50 border-muted-foreground/20 rounded-xl focus-visible:ring-primary/50 transition-all"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                        />
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-11 w-[180px] bg-background/50 border-muted-foreground/20 rounded-xl">
                            <div className="flex items-center gap-2">
                                <FilterIcon className="size-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Category" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 w-[140px] bg-background/50 border-muted-foreground/20 rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {(categoryFilter !== "all" || statusFilter !== "all" || globalFilter !== "") && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setCategoryFilter("all"); setStatusFilter("all"); setGlobalFilter(""); }}
                            className="text-muted-foreground hover:text-foreground h-11 px-3 rounded-xl"
                        >
                            <XIcon className="size-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
                {mounted && hasPermission("create_product") && (
                    <Button onClick={openCreate} className="h-11 px-6 rounded-xl gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all shrink-0">
                        <PlusIcon className="size-4" />
                        Add Product
                    </Button>
                )}
            </div>

            <div className="rounded-2xl border border-muted-foreground/10 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="hover:bg-transparent">
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id} className="h-12 font-semibold">
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="bg-background/40">
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Loading products...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <ImageIcon className="size-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">No products found</p>
                                        <p className="text-xs text-muted-foreground">
                                            {globalFilter ? 'Try adjusting your search' : 'Get started by adding your first product'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} className="hover:bg-muted/60 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!loading && table.getRowModel().rows.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} products
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                    </div>
                </div>
            )}

            <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={selectedProduct} onSuccess={fetchData} categories={categories} />
            <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} product={selectedProduct} onSuccess={fetchData} />
        </div>
    )
}
