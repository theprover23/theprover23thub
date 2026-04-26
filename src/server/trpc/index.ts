import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { auth } from './auth';
import type { Context } from './context';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const moderatorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || (ctx.user.role !== 'moderator' && ctx.user.role !== 'admin')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderator access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
