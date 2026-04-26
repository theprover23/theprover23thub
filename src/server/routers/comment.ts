import { z } from "zod";
import { db } from "@server/db";
import { comments } from "@server/db/schema";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const commentRouter = createTRPCRouter({
  getByArticle: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.comments.findMany({
        where: eq(comments.articleId, input.articleId),
        with: { author: true, replies: { with: { author: true } } },
        orderBy: desc(comments.createdAt),
      });
    }),

  getByForumThread: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.comments.findMany({
        where: eq(comments.forumThreadId, input.threadId),
        with: { author: true },
        orderBy: desc(comments.createdAt),
      });
    }),

  create: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      articleId: z.string().optional(),
      forumThreadId: z.string().optional(),
      memeId: z.string().optional(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const newComment = await db.insert(comments).values({
        ...input,
        authorId: "user-id-placeholder",
      }).returning();
      return newComment[0];
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.update(comments).set(data).where(eq(comments.id, id)).returning();
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),
});
