"use client"

import * as React from "react"
import axios from "@/lib/axios"
import { useCartStore } from "@/store/use-cart-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
    SearchIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingCartIcon,
    CreditCardIcon, XIcon, PackageIcon, Loader2Icon
} from "lucide-react"
import { toast } from "react-hot-toast"

import { Product, Category, Variant, CafeTable } from "./components/types"
import { printReceipt } from "./components/utils"
import { SafeProductImage } from "./components/safe-product-image"
import { CheckoutDialog } from "./components/checkout-dialog"
import { SuccessDialog } from "./components/success-dialog"
import { getImageUrl } from "@/lib/utils"
import QRCode from "qrcode"

export default function POSPage() {
    const [products, setProducts] = React.useState<Product[]>([])
    const [categories, setCategories] = React.useState<Category[]>([])
    const [tables, setTables] = React.useState<CafeTable[]>([])
    const [search, setSearch] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null)
    const [loading, setLoading] = React.useState(true)
    
    // Checkout State
    const [checkoutOpen, setCheckoutOpen] = React.useState(false)
    const [orderType, setOrderType] = React.useState<"dine_in" | "takeaway">("dine_in")
    const [selectedTable, setSelectedTable] = React.useState<number | null>(null)
    const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "card" | "khqr" | "pending">("cash")
    const [cashAmount, setCashAmount] = React.useState("")
    const [processingOrder, setProcessingOrder] = React.useState(false)
    const [selectedGateway, setSelectedGateway] = React.useState<string>("")
    const [gateways, setGateways] = React.useState<any[]>([])
    const [printAfterCheckout, setPrintAfterCheckout] = React.useState(true)
    
    // UI State
    const [selectedVariant, setSelectedVariant] = React.useState<{ product: Product; variant: Variant } | null>(null)
    const [mobileCartOpen, setMobileCartOpen] = React.useState(false)
    const [successOrder, setSuccessOrder] = React.useState<any>(null)
    const [successOpen, setSuccessOpen] = React.useState(false)

    const qrContainerRef = React.useRef<HTMLDivElement>(null)
    const cart = useCartStore()

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true)
            const [productsRes, categoriesRes, tablesRes, gatewaysRes] = await Promise.all([
                axios.get("/products?per_page=100"),
                axios.get("/categories"),
                axios.get("/tables"),
                axios.get("/payment-gateways").catch(() => ({ data: { data: [] } }))
            ])
            setProducts(productsRes.data.data)
            setCategories(categoriesRes.data.data.filter((c: Category) => c.status === 'active'))
            setTables(tablesRes.data.data)
            const activeGateways = (gatewaysRes.data.data || []).filter((g: any) => g.status === 'active' || g.is_active)
            setGateways(activeGateways)
            if (activeGateways.length > 0) {
                setSelectedGateway(activeGateways[0].id.toString())
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault()
                document.getElementById('search-input')?.focus()
            }
            if (e.key === 'F2' && cart.items.length > 0) {
                e.preventDefault()
                setCheckoutOpen(true)
            }
            if (e.key === 'Escape') {
                setCheckoutOpen(false)
                setSelectedVariant(null)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [cart.items.length])

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !selectedCategory || p.category?.id === selectedCategory
        const isActive = p.status === 'active'
        const hasStock = p.variants.some(v => v.stock_qty === undefined || v.stock_qty > 0)
        return matchesSearch && matchesCategory && isActive && hasStock
    })

    const getVariantStock = (variantId: number): number | undefined => {
        for (const product of products) {
            const variant = product.variants.find(v => v.id === variantId)
            if (variant) return variant.stock_qty
        }
        return undefined
    }

    const handleAddToCart = (product: Product, variant: Variant) => {
        if (variant.stock_qty !== undefined && variant.stock_qty !== null) {
            const currentQty = cart.items.find(i => i.variant_id === variant.id)?.quantity || 0
            if (currentQty >= variant.stock_qty) {
                toast.error(`Only ${variant.stock_qty} items available in stock`)
                return
            }
        }

        cart.addItem({
            variant_id: variant.id,
            product_name: product.name,
            size_name: variant.size_name,
            price: variant.price
        })
        toast.success(`Added ${product.name} (${variant.size_name}) to cart`)
        setSelectedVariant(null)
    }

    const handleProductClick = (product: Product) => {
        if (product.variants.length === 1) {
            handleAddToCart(product, product.variants[0])
        } else {
            setSelectedVariant({ product, variant: product.variants[0] })
        }
    }

    const handleCheckout = async () => {
        if (cart.items.length === 0) {
            toast.error("Cart is empty")
            return
        }

        const outOfStockItems = cart.items.filter(item => {
            const stockQty = getVariantStock(item.variant_id)
            return stockQty !== undefined && item.quantity > stockQty
        })

        if (outOfStockItems.length > 0) {
            toast.error("Some items exceed available stock. Please adjust quantities.")
            return
        }

        if (orderType === "dine_in") {
            if (!selectedTable) {
                toast.error("Please select a table for dine-in orders")
                return
            }
            const table = tables.find(t => t.id === selectedTable)
            if (table && table.status !== 'available') {
                toast.error("Selected table is not available")
                return
            }
        }

        if (paymentMethod === "cash") {
            const cashValue = parseFloat(cashAmount)
            if (!cashAmount || isNaN(cashValue) || cashValue < cart.total()) {
                toast.error(`Cash amount must be at least $${cart.total().toFixed(2)}`)
                return
            }
        } else if (paymentMethod === 'pending') {
            // Pending orders don't require further validation here
        }

        setProcessingOrder(true)
        try {
            let finalGatewayId = null
            let qrCodeDataUrl = ""
            
            if (paymentMethod === "card" && selectedGateway) {
                finalGatewayId = parseInt(selectedGateway)
            } else if (paymentMethod === "khqr") {
                const khqrGateway = gateways.find(g => g.provider === "khqr" && (g.status === "active" || g.is_active))
                if (khqrGateway) finalGatewayId = khqrGateway.id
                
                try {
                    // Logic to build dummy KHQR string to save on Receipt (copied from dynamic KHQR)
                    qrCodeDataUrl = await QRCode.toDataURL("dummy_qr_code_for_receipt", { margin: 1, width: 256 })
                } catch (e) {
                    console.error("QR fail:", e)
                }
            }

            const orderData = {
                type: orderType,
                table_id: orderType === "dine_in" ? selectedTable : null,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'pending' ? 'pending' : 'paid',
                paid_amount: paymentMethod === "cash" ? parseFloat(cashAmount) : (paymentMethod === 'pending' ? 0 : cart.total()),
                gateway_id: finalGatewayId,
                items: cart.items.map(item => ({
                    product_variant_id: item.variant_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.price * item.quantity
                }))
            }

            const res = await axios.post("/orders", orderData)
            const createdOrder = res.data.data || res.data

            const change = paymentMethod === "cash" ? (parseFloat(cashAmount) - cart.total()) : 0
            const resolvedTable = orderType === "dine_in" && selectedTable 
                ? tables.find(t => t.id === selectedTable)?.number 
                : ""
            
            const receiptPayload = {
                id: createdOrder?.id || Math.floor(Math.random() * 10000),
                type: orderType,
                table_number: resolvedTable ? `Table ${resolvedTable}` : "",
                items: cart.items.map(item => ({
                    quantity: item.quantity,
                    product_name: item.product_name,
                    size_name: item.size_name,
                    price: item.price
                })),
                subtotal: cart.subtotal(),
                tax: cart.subtotal() * cart.taxRate,
                discount: cart.discount,
                total: cart.total(),
                payment_method: paymentMethod,
                paid_amount: paymentMethod === "cash" ? parseFloat(cashAmount) : cart.total(),
                qr_code_url: qrCodeDataUrl
            }

            if (printAfterCheckout && paymentMethod !== 'pending') {
                printReceipt(receiptPayload, change > 0 ? change : 0, 'cashier')
                setTimeout(() => printReceipt(receiptPayload, 0, 'kitchen'), 300)
                setTimeout(() => printReceipt(receiptPayload, 0, 'bar'), 600)
            }

            setSuccessOrder({ ...receiptPayload, change: change > 0 ? change : 0 })
            setSuccessOpen(true)
            toast.success("Order placed successfully!")

            cart.clearCart()
            setCheckoutOpen(false)
            setOrderType("dine_in")
            setSelectedTable(null)
            setPaymentMethod("cash")
            setCashAmount("")

            const tablesRes = await axios.get("/tables")
            setTables(tablesRes.data.data)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to process order")
        } finally {
            setProcessingOrder(false)
        }
    }

    const subtotal = cart.subtotal()
    const tax = subtotal * cart.taxRate
    const total = cart.total()

    const suggestedAmounts = [
        Math.ceil(total),
        Math.ceil(total / 10) * 10,
        Math.ceil(total / 20) * 20,
        Math.ceil(total / 50) * 50
    ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4)

    const renderCart = (isMobile = false) => {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="pb-4 bg-muted/20 border-b p-4 shrink-0">
                    <h2 className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <ShoppingCartIcon className="size-5" />
                        </div>
                        Current Order
                        {cart.items.length > 0 && (
                            <Badge className="ml-auto bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full shadow-sm">
                                {cart.items.reduce((acc, item) => acc + item.quantity, 0)} items
                            </Badge>
                        )}
                    </h2>
                </div>
                <Separator />
                <div className="flex-1 p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4 min-h-0">
                        {cart.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                                <ShoppingCartIcon className="size-16 mb-3 opacity-50" />
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.items.map(item => {
                                    const stockQty = getVariantStock(item.variant_id)
                                    const isLowStock = stockQty !== undefined && stockQty < 10
                                    const isOutOfStock = stockQty !== undefined && item.quantity > stockQty

                                    return (
                                        <div key={item.variant_id} className={`flex gap-3 p-3.5 rounded-2xl border bg-background shadow-sm ${isOutOfStock ? 'border-destructive bg-destructive/5' : ''}`}>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <p className="font-bold text-sm truncate">{item.product_name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.size_name}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-primary mt-2">
                                                    ${Number(item.price).toFixed(2)} × {item.quantity} = ${(Number(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                                {isOutOfStock && <p className="text-xs text-destructive mt-1 font-medium">⚠ Only {stockQty} in stock</p>}
                                                {isLowStock && !isOutOfStock && <p className="text-xs text-amber-600 mt-1 font-medium">Low stock: {stockQty} left</p>}
                                            </div>
                                            <div className="flex flex-col gap-1 items-end">
                                                <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => cart.updateQuantity(item.variant_id, item.quantity - 1)}>
                                                        <MinusIcon className="size-3" />
                                                    </Button>
                                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => cart.updateQuantity(item.variant_id, item.quantity + 1)} disabled={stockQty !== undefined && item.quantity >= stockQty}>
                                                        <PlusIcon className="size-3" />
                                                    </Button>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 mt-auto" onClick={() => cart.removeItem(item.variant_id)}>
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {cart.items.length > 0 && (
                        <div className="p-4 space-y-3 bg-muted/30 shrink-0 border-t">
                            <div className="space-y-2.5 text-sm p-4 bg-background rounded-2xl border shadow-inner">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Subtotal</span>
                                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Tax ({(cart.taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-semibold">${tax.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="text-base font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-black text-primary tracking-tight">${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => cart.clearCart()}>
                                    <XIcon className="size-4 mr-2" />
                                    Clear
                                </Button>
                                <Button
                                    className="flex-[2] h-12 rounded-xl text-md font-bold"
                                    onClick={() => {
                                        if (isMobile) setMobileCartOpen(false)
                                        setCheckoutOpen(true)
                                    }}
                                >
                                    <CreditCardIcon className="size-5 mr-2" />
                                    Checkout (F2)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
            <title>POS Terminal</title>
            <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/40 overflow-hidden relative">
                {/* Main Product Area */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                    {/* Search and Categories */}
                    <div className="space-y-4 pt-2">
                        <div className="relative group">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input
                                id="search-input"
                                placeholder="Search products (Press F1)..."
                                className="pl-12 h-14 bg-background/80 backdrop-blur-sm rounded-2xl text-lg"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex gap-3 pb-3 px-1">
                                <Button
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(null)}
                                    className={`shrink-0 rounded-full px-6 transition-all ${selectedCategory === null ? 'shadow-md shadow-primary/20' : 'bg-background'}`}
                                >
                                    All Products
                                </Button>
                                {categories.map(category => (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`shrink-0 rounded-full px-6 transition-all ${selectedCategory === category.id ? 'shadow-md shadow-primary/20' : 'bg-background'}`}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>

                    {/* Products Grid */}
                    <ScrollArea className="flex-1 min-h-0">
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6 px-1">
                                {filtered.map(product => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer group overflow-hidden border-muted-foreground/10 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 bg-background/60 backdrop-blur-md rounded-2xl flex flex-col"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <CardContent className="p-0 flex-1 flex flex-col">
                                            <div className="aspect-[4/3] relative bg-muted/50 overflow-hidden shrink-0">
                                                <SafeProductImage src={product.image ? getImageUrl(product.image) : undefined} alt={product.name} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                                                    {product.variants.length > 1 && <Badge className="bg-background/80 text-foreground backdrop-blur-md border-none shadow-sm font-semibold">{product.variants.length} sizes</Badge>}
                                                    {product.variants.some(v => v.stock_qty !== undefined && v.stock_qty < 10) && <Badge variant="destructive" className="shadow-sm font-semibold animate-pulse">Low Stock</Badge>}
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                                <p className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <p className="text-lg font-bold text-primary">
                                                        ${Math.min(...product.variants.map(v => Number(v.price))).toFixed(2)}
                                                        {product.variants.length > 1 && <span className="text-sm text-muted-foreground font-normal ml-1">+</span>}
                                                    </p>
                                                    {product.category && <Badge variant="secondary" className="text-xs bg-secondary/50 rounded-lg">{product.category.name}</Badge>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Desktop Cart Sidebar */}
                <Card className="hidden lg:flex w-[400px] m-4 flex-col shadow-2xl shadow-black/5 border-muted-foreground/10 bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden z-10 shrink-0">
                    {renderCart(false)}
                </Card>

                {/* Mobile Cart Button */}
                {cart.items.length > 0 && (
                    <Button
                        onClick={() => setMobileCartOpen(true)}
                        className="fixed bottom-6 right-6 z-40 size-16 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all lg:hidden flex items-center justify-center gap-1 hover:bg-primary/90"
                    >
                        <div className="relative">
                            <ShoppingCartIcon className="size-6" />
                            <span className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground text-[10px] font-bold size-5 rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-background">
                                {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        </div>
                    </Button>
                )}

                {/* Mobile Cart Sheet */}
                <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
                    <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 rounded-l-3xl overflow-hidden border-l bg-background/95 backdrop-blur-xl">
                        {renderCart(true)}
                    </SheetContent>
                </Sheet>

                {/* Variant Selection Dialog */}
                <Dialog open={!!selectedVariant} onOpenChange={() => setSelectedVariant(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Size</DialogTitle>
                        </DialogHeader>
                        {selectedVariant && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{selectedVariant.product.name}</h3>
                                </div>
                                <RadioGroup
                                    value={selectedVariant.variant.id.toString()}
                                    onValueChange={(value) => {
                                        const variant = selectedVariant.product.variants.find(v => v.id.toString() === value)
                                        if (variant) setSelectedVariant({ ...selectedVariant, variant })
                                    }}
                                >
                                    {selectedVariant.product.variants.map(variant => (
                                        <div key={variant.id} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                                            <RadioGroupItem value={variant.id.toString()} id={`variant-${variant.id}`} />
                                            <Label htmlFor={`variant-${variant.id}`} className="flex-1 cursor-pointer">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{variant.size_name}</span>
                                                    <span className="font-semibold text-primary">${Number(variant.price).toFixed(2)}</span>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <Button className="w-full" onClick={() => handleAddToCart(selectedVariant.product, selectedVariant.variant)}>Add to Cart</Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Checkout & Success Dialogs */}
                <CheckoutDialog 
                    open={checkoutOpen}
                    onOpenChange={setCheckoutOpen}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    tables={tables}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    cashAmount={cashAmount}
                    setCashAmount={setCashAmount}
                    gateways={gateways}
                    selectedGateway={selectedGateway}
                    setSelectedGateway={setSelectedGateway}
                    printAfterCheckout={printAfterCheckout}
                    setPrintAfterCheckout={setPrintAfterCheckout}
                    total={total}
                    subtotal={subtotal}
                    tax={tax}
                    discount={cart.discount}
                    suggestedAmounts={suggestedAmounts}
                    processingOrder={processingOrder}
                    handleCheckout={handleCheckout}
                    qrContainerRef={qrContainerRef}
                />

                <SuccessDialog 
                    open={successOpen}
                    onOpenChange={setSuccessOpen}
                    successOrder={successOrder}
                    onNewOrder={() => { setSuccessOpen(false); setSuccessOrder(null) }}
                />
            </div>
        </>
    )
}
