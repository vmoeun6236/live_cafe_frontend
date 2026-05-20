import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/endpoints';
import { Product } from '@/lib/types';

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.PRODUCTS);
      return data.data; // Changed from 'data' to 'data.data' to match API Resource response
    },
  });
};
