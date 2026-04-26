import { inferAsyncReturnType, createTRPCContext } from '@trpc/server';
import { auth } from './auth';
import { db } from '../db';

export async function createContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    db,
    headers: opts.headers,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
