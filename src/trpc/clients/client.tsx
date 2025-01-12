'use client'
import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import { AppRouter } from '../server/routers'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getUrl } from './shared'

export const trpcClient = createTRPCReact<AppRouter>()

interface TRPCReactProviderProps {
  children: ReactNode
}

export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [trcp] = useState(() =>
    trpcClient.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <trpcClient.Provider client={trcp} queryClient={queryClient}>
        {children}
      </trpcClient.Provider>
    </QueryClientProvider>
  )
}
