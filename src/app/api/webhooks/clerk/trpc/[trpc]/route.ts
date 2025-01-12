import { createTRPCContext } from '@/trpc/server'
import { appRouter } from '@/trpc/server/routers'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'

const createContext = async (req: NextRequest) => {
  const trpcContext = createTRPCContext({
    headers: req.headers,
  })

  return trpcContext
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (req: NextRequest) => {
  fetchRequestHandler({
    endpoint: 'api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
  })
}
