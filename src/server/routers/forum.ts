import { z } from "zod";
import { db } from "@server/db";
import { forumCategories, forumThreads, forumPosts } from "@server/db/schema";
import { eq, desc, asc, like, or, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const forumRouter = createTRPCRouter({
  getCategories: publicProcedure.query(async () => {
    return await db.query.forumCategories.findMany({
      with: { threads: true },
      orderBy: asc(forumCategories.order),
    });
  }),

  getThreads: publicProcedure
    .input(z.object({
      categoryId: z.string().optional(),
      sortBy: z.enum(["newest", "oldest", "popular", "replies"]).default("newest"),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      let orderBy = desc(forumThreads.createdAt);
      if (input.sortBy === "oldest") orderBy = asc(forumThreads.createdAt);
      if (input.sortBy === "popular") orderBy = desc(forumThreads.views);
      if (input.sortBy === "replies") orderBy = desc(forumThreads.repliesCount);

      const conditions = [];
      if (input.categoryId) conditions.push(eq(forumThreads.categoryId, input.categoryId));
      if (input.search) conditions.push(or(like(forumThreads.title, `%${input.search}%`), like(forumThreads.content, `%${input.search}%`)));

      return await db.query.forumThreads.findMany({
        with: { author: true, category: true },
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy,
        limit: 50,
      });
    }),

  getThreadById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const thread = await db.query.forumThreads.findFirst({
        where: eq(forumThreads.id, input.id),
        with: { 
          author: true, 
          category: true,
          posts: { with: { author: true }, orderBy: asc(forumPosts.createdAt) },
        },
      });

      if (!thread) throw new Error("Thread not found");

      await db.update(forumThreads).set({ views: thread.views + 1 }).where(eq(forumThreads.id, input.id));

      return thread;
    }),

  createThread: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      categoryId: z.string(),
      tags: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      const newThread = await db.insert(forumThreads).values({
        ...input,
        authorId: "user-id-placeholder",
      }).returning();
      return newThread[0];
    }),

  createPost: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      threadId: z.string(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const newPost = await db.insert(forumPosts).values({
        ...input,
        authorId: "user-id-placeholder",
      }).returning();

      await db.update(forumThreads)
        .set({ repliesCount: (await db.query.forumThreads.findFirst({ where: eq(forumThreads.id, input.threadId) }))!.repliesCount + 1 })
        .where(eq(forumThreads.id, input.threadId));

      return newPost[0];
    }),

  markAsSolution: publicProcedure
    .input(z.object({ postId: z.string(), threadId: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(forumPosts).set({ isSolution: true }).where(eq(forumPosts.id, input.postId));
      await db.update(forumThreads).set({ solvedPostId: input.postId }).where(eq(forumThreads.id, input.threadId));
      return { success: true };
    }),

  lockThread: publicProcedure
    .input(z.object({ id: z.string(), locked: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.update(forumThreads).set({ isLocked: input.locked }).where(eq(forumThreads.id, input.id));
      return { success: true };
    }),

  deleteThread: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(forumThreads).where(eq(forumThreads.id, input.id));
      return { success: true };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await db.query.forumThreads.findMany({
        where: or(like(forumThreads.title, `%${input.query}%`), like(forumThreads.content, `%${input.query}%`)),
        with: { author: true, category: true },
        limit: 20,
      });
    }),
});
