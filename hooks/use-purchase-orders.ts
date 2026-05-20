import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { PurchaseOrder } from '@/app/dashboard/purchase-orders/components/types';

export const usePurchaseOrders = () => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.ORDERS); // Adjust endpoint if needed
      return data.data;
    },
  });
};
