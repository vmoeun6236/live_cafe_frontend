import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { Order } from '@/app/dashboard/kitchen/components/types';

export const useKitchenOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const { data } = await api.get('/kitchen/orders');
      return data.data;
    },
  });
};
