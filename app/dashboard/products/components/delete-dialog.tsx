"use client"

import * as React from "react"
import { toast } from "react-hot-toast"
import { LoaderIcon } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import api from "@/lib/axios"
import { Product } from "./types"

export function DeleteDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    product: Product | null
    onSuccess: () => void
}) {
    const [loading, setLoading] = React.useState(false)

    async function handleDelete() {
        if (!product) return
        setLoading(true)
        try {
            await api.delete(`/products/${product.id}`)
            toast.success("Product deleted")
            onOpenChange(false)
            onSuccess()
        } catch (error: unknown) {
            console.error("Delete error:", error)
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err.response?.data?.message || "Delete failed: Internal Server Error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{product?.name}</span>? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
