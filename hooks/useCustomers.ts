import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { toast } from "react-hot-toast"

export interface Customer {
    id: number
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    customer_type: 'regular' | 'vip' | 'wholesale'
    credit_limit: number
    current_balance: number
    loyalty_points: number
    notes: string
    created_at: string
    updated_at: string
}

export const useCustomers = () => {
    const queryClient = useQueryClient()

    const { data: customers = [], isLoading } = useQuery<Customer[]>({
        queryKey: ["customers"],
        queryFn: async () => {
            const { data } = await apiClient.get('/customers')
            return data.data
        },
    })

    const createCustomer = useMutation({
        mutationFn: (data: any) => apiClient.post('/customers', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            toast.success("Customer created successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create customer")
        }
    })

    const updateCustomer = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/customers/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            toast.success("Customer updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update customer")
        }
    })

    const deleteCustomer = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/customers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            toast.success("Customer deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete customer")
        }
    })

    return {
        customers,
        isLoading,
        createCustomer,
        updateCustomer,
        deleteCustomer
    }
}
