"use client"

import * as React from "react"
import Image from "next/image"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { ImageIcon, MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/axios"
import { getImageUrl } from "@/lib/utils"

import { Product, Category, ProductFormValues, productFormSchema } from "./types"

export function ProductFormDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
    categories,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    product: Product | null
    onSuccess: () => void
    categories: Category[]
}) {
    const isEdit = !!product
    const [imageFile, setImageFile] = React.useState<File | null>(null)
    const [imagePreview, setImagePreview] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            description: "",
            category_id: "",
            status: "active",
            variants: [{ size_name: "Regular", price: 0, stock_qty: 0, barcode: "" }]
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants"
    })

    React.useEffect(() => {
        if (open) {
            setImageFile(null)
            setImagePreview(product ? getImageUrl(product.image) : null)
            if (product) {
                console.log("Loading variants:", product.variants);
                const uniqueVariants = Array.from(new Map(product.variants.map(v => [v.id, v])).values());
                form.reset({
                    name: product.name,
                    description: product.description ?? "",
                    category_id: product.category?.id?.toString() ?? "",
                    status: product.status,
                    variants: uniqueVariants.map(v => ({
                        id: v.id,
                        size_name: v.size_name,
                        price: v.price,
                        stock_qty: v.stock_qty,
                        barcode: v.barcode ?? ""
                    }))
                })
            } else {
                form.reset({
                    name: "",
                    description: "",
                    category_id: "",
                    status: "active",
                    variants: [{ size_name: "Regular", price: 0, stock_qty: 0, barcode: "" }]
                })
            }
        }
    }, [open, product, form, categories])

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    function removeImage() {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    async function onSubmit(data: ProductFormValues) {
        try {
            const fd = new FormData()
            fd.append("name", data.name)
            fd.append("description", data.description || "")
            fd.append("category_id", data.category_id)
            fd.append("status", data.status)

            if (imageFile) {
                fd.append("image", imageFile)
            }

            data.variants.forEach((v, index) => {
                console.log(`Variant ${index}:`, v);
                if (v.id) {
                    fd.append(`variants[${index}][id]`, v.id.toString())
                }
                fd.append(`variants[${index}][size_name]`, v.size_name)
                fd.append(`variants[${index}][price]`, v.price.toString())
                fd.append(`variants[${index}][stock_qty]`, v.stock_qty.toString())
                if (v.barcode) {
                    fd.append(`variants[${index}][barcode]`, v.barcode)
                }
            })

            if (isEdit) {
                fd.append("_method", "PUT")
                await api.post(`/products/${product!.id}`, fd)
                toast.success("Product updated")
            } else {
                await api.post("/products", fd)
                toast.success("Product created")
            }
            onOpenChange(false)
            onSuccess()
        } catch (error: unknown) {
            console.error("Save product error:", error)
            const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
            
            const errorMessage = err.response?.data?.message || "Failed to save product"
            const validationErrors = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(", ")
                : ""
            
            toast.error(validationErrors ? `${errorMessage}: ${validationErrors}` : errorMessage, {
                duration: 5000
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Image Upload */}
                    <div className="space-y-1.5">
                        <Label>Product Image</Label>
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div
                                className="relative h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Product preview"
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage() }}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                                        >
                                            <MinusIcon className="size-3" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <ImageIcon className="size-6" />
                                        <span className="text-xs">Upload</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 justify-center pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon className="size-4 mr-2" />
                                    {imagePreview ? "Change Image" : "Choose Image"}
                                </Button>
                                {imagePreview && (
                                    <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-destructive hover:text-destructive">
                                        Remove
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Name</Label>
                            <Input {...form.register("name")} className={form.formState.errors.name ? "border-destructive" : ""} />
                            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select
                                value={form.watch("category_id")}
                                onValueChange={(v) => form.setValue("category_id", v)}
                            >
                                <SelectTrigger className={form.formState.errors.category_id ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.category_id && <p className="text-xs text-destructive">{form.formState.errors.category_id.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea {...form.register("description")} />
                    </div>

                    <div className="space-y-2">
                        <Label>Variants</Label>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="space-y-2 p-3 border rounded-lg relative">
                                    <input type="hidden" {...form.register(`variants.${index}.id` as const)} />
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase">Size</Label>
                                            <Input placeholder="Size" {...form.register(`variants.${index}.size_name` as const)} className={form.formState.errors.variants?.[index]?.size_name ? "border-destructive" : ""} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase">Price</Label>
                                            <Input type="number" placeholder="Price" step="0.01" {...form.register(`variants.${index}.price` as const)} className={form.formState.errors.variants?.[index]?.price ? "border-destructive" : ""} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase">Stock</Label>
                                            <Input type="number" placeholder="Stock" {...form.register(`variants.${index}.stock_qty` as const)} className={form.formState.errors.variants?.[index]?.stock_qty ? "border-destructive" : ""} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase">Barcode</Label>
                                            <Input placeholder="Barcode" {...form.register(`variants.${index}.barcode` as const)} />
                                        </div>
                                    </div>
                                    {fields.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm">
                                            <MinusIcon className="size-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ size_name: "", price: 0, stock_qty: 0, barcode: "" })}>
                                <PlusIcon className="mr-2 size-4" /> Add Variant
                            </Button>
                            {form.formState.errors.variants?.root && <p className="text-xs text-destructive">{form.formState.errors.variants.root.message}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving..." : "Save Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
