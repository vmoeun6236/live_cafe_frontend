"use client"

import * as React from "react"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    SearchIcon,
    RefreshCwIcon,
    EditIcon,
    AlertTriangleIcon,
    PackageIcon,
    Loader2Icon,
    TrendingUpIcon,
    TrendingDownIcon
} from "lucide-react"
import { toast } from "react-hot-toast"

interface Variant {
    id: number
    size_name: string
    price: number
    stock_qty: number | null
    barcode: string | null
}

interface Category {
    id: number
    name: string
}

interface Product {
    id: number
    name: string
    description: string | null
    status: string
    image: string | null
    category: Category
    variants: Variant[]
}

export default function StockManagementPage() {
    const [products, setProducts] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [selectedVariant, setSelectedVariant] = React.useState<{
        product: Product
        variant: Variant
    } | null>(null)
    const [editOpen, setEditOpen] = React.useState(false)
    const [newStock, setNewStock] = React.useState("")
    const [updating, setUpdating] = React.useState(false)

    const fetchProducts = React.useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get("/products?per_page=1000")
            setProducts(res.data.data)
        } catch (error) {
            console.error("Failed to fetch products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleEditStock = (product: Product, variant: Variant) => {
        setSelectedVariant({ product, variant })
        setNewStock(variant.stock_qty?.toString() || "0")
        setEditOpen(true)
    }

    const handleUpdateStock = async () => {
        if (!selectedVariant) return

        const stockValue = parseInt(newStock)
        if (isNaN(stockValue) || stockValue < 0) {
            toast.error("Please enter a valid stock quantity")
            return
        }

        setUpdating(true)
        try {
            // Update the product with new variant stock
            const updatedVariants = selectedVariant.product.variants.map(v =>
                v.id === selectedVariant.variant.id
                    ? { ...v, stock_qty: stockValue }
                    : v
            )

            await axios.put(`/products/${selectedVariant.product.id}`, {
                name: selectedVariant.product.name,
                category_id: selectedVariant.product.category.id,
                description: selectedVariant.product.description,
                status: selectedVariant.product.status,
                variants: updatedVariants.map(v => ({
                    size_name: v.size_name,
                    price: v.price,
                    stock_qty: v.stock_qty,
                    barcode: v.barcode
                }))
            })

            toast.success("Stock updated successfully")
            fetchProducts()
            setEditOpen(false)
            setSelectedVariant(null)
        } catch (error: unknown) {
            console.error("Failed to update stock:", error)
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update stock")
        } finally {
            setUpdating(false)
        }
    }

    const getStockStatus = (stock: number | null) => {
        if (stock === null) return { label: "Untracked", color: "bg-gray-500" }
        if (stock === 0) return { label: "Out of Stock", color: "bg-red-500" }
        if (stock < 10) return { label: "Low Stock", color: "bg-orange-500" }
        if (stock < 50) return { label: "Medium", color: "bg-yellow-500" }
        return { label: "In Stock", color: "bg-green-500" }
    }

    const totalProducts = products.length
    const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0)
    const lowStockCount = products.reduce((acc, p) =>
        acc + p.variants.filter(v => v.stock_qty !== null && v.stock_qty < 10).length, 0
    )
    const outOfStockCount = products.reduce((acc, p) =>
        acc + p.variants.filter(v => v.stock_qty === 0).length, 0
    )

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Stock Management</h1>
                    <p className="text-muted-foreground">Monitor and manage inventory levels</p>
                </div>
                <Button onClick={fetchProducts} disabled={loading}>
                    <RefreshCwIcon className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">{totalVariants} variants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Low Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Items below 10</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Out of Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                        <p className="text-xs text-muted-foreground">Items at 0</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Stock Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalVariants > 0 ? Math.round(((totalVariants - outOfStockCount) / totalVariants) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Available items</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products or categories..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stock Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <PackageIcon className="size-12 mb-2" />
                            <p>No products found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(product =>
                                    product.variants.map((variant, idx) => (
                                        <TableRow key={`${product.id}-${variant.id}`}>
                                            {idx === 0 && (
                                                <TableCell rowSpan={product.variants.length} className="font-medium">
                                                    {product.name}
                                                </TableCell>
                                            )}
                                            {idx === 0 && (
                                                <TableCell rowSpan={product.variants.length}>
                                                    <Badge variant="outline">{product.category?.name || 'N/A'}</Badge>
                                                </TableCell>
                                            )}
                                            <TableCell>{variant.size_name}</TableCell>
                                            <TableCell>${Number(variant.price).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {variant.stock_qty === null ? (
                                                        <span className="text-muted-foreground">-</span>
                                                    ) : (
                                                        <>
                                                            <span className="font-semibold">{variant.stock_qty}</span>
                                                            {variant.stock_qty < 10 && variant.stock_qty > 0 && (
                                                                <TrendingDownIcon className="size-4 text-orange-500" />
                                                            )}
                                                            {variant.stock_qty === 0 && (
                                                                <AlertTriangleIcon className="size-4 text-red-500" />
                                                            )}
                                                            {variant.stock_qty >= 50 && (
                                                                <TrendingUpIcon className="size-4 text-green-500" />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStockStatus(variant.stock_qty).color}>
                                                    {getStockStatus(variant.stock_qty).label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditStock(product, variant)}
                                                >
                                                    <EditIcon className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Stock Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Stock Level</DialogTitle>
                    </DialogHeader>
                    {selectedVariant && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg space-y-1">
                                <p className="font-semibold">{selectedVariant.product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Variant: {selectedVariant.variant.size_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Current Stock: {selectedVariant.variant.stock_qty ?? 'Untracked'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-stock">New Stock Quantity</Label>
                                <Input
                                    id="new-stock"
                                    type="number"
                                    min="0"
                                    value={newStock}
                                    onChange={e => setNewStock(e.target.value)}
                                    placeholder="Enter stock quantity"
                                />
                            </div>

                            {newStock && !isNaN(parseInt(newStock)) && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <p className="text-sm">
                                        <span className="font-medium">Change: </span>
                                        {parseInt(newStock) - (selectedVariant.variant.stock_qty ?? 0) > 0 ? (
                                            <span className="text-green-600">
                                                +{parseInt(newStock) - (selectedVariant.variant.stock_qty ?? 0)} units
                                            </span>
                                        ) : (
                                            <span className="text-red-600">
                                                {parseInt(newStock) - (selectedVariant.variant.stock_qty ?? 0)} units
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updating}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStock} disabled={updating}>
                            {updating ? (
                                <>
                                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Stock'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
