import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração do QueryClient para React Query
 * 
 * Configurações:
 * - staleTime: Tempo que os dados são considerados "frescos" (não refetch automático)
 * - gcTime: Tempo que dados inativos ficam em cache (antigo cacheTime)
 * - retry: Número de tentativas em caso de erro
 * - refetchOnWindowFocus: Refetch ao focar na janela
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0, // Mutations não fazem retry por padrão
    },
  },
});

export default queryClient;
