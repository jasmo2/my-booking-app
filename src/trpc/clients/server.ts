import { cache } from 'react'
import { createTRPCContext } from '../server'
import { headers } from 'next/headers'
import { createTRPCProxyClient, TRPCClientError } from '@trpc/client'
import { appRouter, AppRouter } from '../server/routers'
import { observable } from '@trpc/server/observable'
import { callProcedure } from '@trpc/server'

const createContext = cache(async () => {
  const h = await headers()
  const heads = new Headers(h)
  heads.set('x-trpc', 'rsc')

  return createTRPCContext({
    headers: heads,
  })
})

export const trpcServer = createTRPCProxyClient<AppRouter>({
  links: [
    () =>
      ({ op: { input, path, type } }) =>
        observable((observer) => {
          createContext()
            .then((ctx) =>
              callProcedure({
                ctx,
                path,
                procedures: appRouter._def.procedures,
                rawInput: input,
                type,
              }),
            )
            .then((data) => {
              observer.next({
                result: { data },
              })
              observer.complete()
            })
            .catch((err) => {
              observer.error(TRPCClientError.from(err))
            })
        }),
  ],
})
