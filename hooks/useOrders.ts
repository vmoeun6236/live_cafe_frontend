import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/constants/endpoints"
import { Order } from "@/app/dashboard/orders/components/types"
import { toast } from "react-hot-toast"

export const useOrders = () => {
    const queryClient = useQueryClient()

    const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
        queryKey: ["orders"],
        queryFn: async () => {
            const { data } = await apiClient.get(API_ENDPOINTS.ORDERS)
            return data.data
        },
    })

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success("Order status updated")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update status")
        }
    })

    const updatePayment = useMutation({
        mutationFn: ({ id, payment_status, total, method }: { id: number; payment_status: string, total: number, method?: string }) =>
            apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/payment`, {
                payment_status,
                payment_method: method,
                paid_amount: total,
                change_amount: 0
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success("Payment status updated")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update payment")
        }
    })

    const cancelOrder = useMutation({
        mutationFn: (id: number) =>
            apiClient.post(`${API_ENDPOINTS.ORDERS}/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success("Order cancelled and stock restored")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel order")
        }
    })

    const updateOrderItems = useMutation({
        mutationFn: ({ id, items }: { id: number; items: any[] }) =>
            apiClient.patch(`${API_ENDPOINTS.ORDERS}/${id}/items`, { items }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            toast.success("Order items updated")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update items")
        }
    })

    return {
        orders,
        isLoading,
        refetch,
        updateStatus,
        updatePayment,
        cancelOrder,
        updateOrderItems
    }
}
