import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from "@tradoora/backend/trpc/router";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      retry: (failureCount, error) => {
        if ((error as any)?.data?.code === 'UNAUTHORIZED') {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: import.meta.env.VITE_API_URL + '/trpc',
      async headers() {
        const headers: Record<string, string> = {};
      
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      
        return headers;
      },
    }),
  ],
});