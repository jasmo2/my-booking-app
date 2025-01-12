import { createTRPCRouter, publicProcedure } from '../index'

export const appRouter = createTRPCRouter({
  // 👇 define your endpoints here
  hello: publicProcedure.query(({}) => {
    return { greeting: 'Hello World' }
  }),
})

export type AppRouter = typeof appRouter
