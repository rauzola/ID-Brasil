'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configurações do QueryClient
const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
} as const;

// Instância do QueryClient
const queryClient = new QueryClient(QUERY_CLIENT_CONFIG);

// Props do componente QueryProvider
interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider do React Query
 * Configura o cliente de queries para gerenciamento de estado do servidor
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};