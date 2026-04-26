import { z } from "zod";
import { db } from "@server/db";
import { memes, comments, reactions } from "@server/db/schema";
import { eq, desc, asc, like, or, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const memeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      sortBy: z.enum(["newest", "oldest", "popular"]).default("popular"),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      let orderBy = desc(memes.likes);
      if (input.sortBy === "newest") orderBy = desc(memes.createdAt);
      if (input.sortBy === "oldest") orderBy = asc(memes.createdAt);

      const conditions = [];
      if (input.search) conditions.push(or(like(memes.title, `%${input.search}%`)));

      return await db.query.memes.findMany({
        with: { author: true },
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy,
        limit: input.limit,
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const meme = await db.query.memes.findFirst({
        where: eq(memes.id, input.id),
        with: { author: true, comments: { with: { author: true } } },
      });
      if (!meme) throw new Error("Meme not found");
      return meme;
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      imageUrl: z.string().url(),
      tags: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      const newMeme = await db.insert(memes).values({
        ...input,
        authorId: "user-id-placeholder",
      }).returning();
      return newMeme[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(memes).where(eq(memes.id, input.id));
      return { success: true };
    }),

  toggleLike: publicProcedure
    .input(z.object({ memeId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.reactions.findFirst({
        where: and(eq(reactions.memeId, input.memeId), eq(reactions.userId, input.userId)),
      });

      if (existing) {
        await db.delete(reactions).where(eq(reactions.id, existing.id));
        await db.update(memes).set({ likes: (await db.query.memes.findFirst({ where: eq(memes.id, input.memeId) }))!.likes - 1 }).where(eq(memes.id, input.memeId));
        return { liked: false };
      } else {
        await db.insert(reactions).values({ memeId: input.memeId, userId: input.userId, type: "like" });
        await db.update(memes).set({ likes: (await db.query.memes.findFirst({ where: eq(memes.id, input.memeId) }))!.likes + 1 }).where(eq(memes.id, input.memeId));
        return { liked: true };
      }
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await db.query.memes.findMany({
        where: or(like(memes.title, `%${input.query}%`)),
        with: { author: true },
        limit: 20,
      });
    }),
});
