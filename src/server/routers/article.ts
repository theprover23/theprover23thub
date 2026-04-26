import { z } from "zod";
import { db } from "@server/db";
import { articles, comments, reactions } from "@server/db/schema";
import { eq, desc, asc, like, or, and, count } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const articleRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      cursor: z.string().optional(),
      sortBy: z.enum(["newest", "oldest", "popular"]).default("newest"),
    }))
    .query(async ({ input }) => {
      let orderBy = desc(articles.createdAt);
      if (input.sortBy === "oldest") orderBy = asc(articles.createdAt);
      if (input.sortBy === "popular") orderBy = desc(articles.likes);

      const items = await db.query.articles.findMany({
        with: { author: true },
        where: input.cursor ? and(articles.isPublished === true) : articles.isPublished === true,
        orderBy,
        limit: input.limit + 1,
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, input.id),
        with: { author: true, comments: { with: { author: true } } },
      });

      if (!article) throw new Error("Article not found");

      await db.update(articles).set({ views: article.views + 1 }).where(eq(articles.id, input.id));

      return article;
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      const newArticle = await db.insert(articles).values({
        ...input,
        authorId: "user-id-placeholder",
        isPublished: false,
      }).returning();
      return newArticle[0];
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(1).optional(),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updated = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
      return updated[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(articles).where(eq(articles.id, input.id));
      return { success: true };
    }),

  toggleLike: publicProcedure
    .input(z.object({ articleId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.reactions.findFirst({
        where: and(eq(reactions.articleId, input.articleId), eq(reactions.userId, input.userId)),
      });

      if (existing) {
        await db.delete(reactions).where(eq(reactions.id, existing.id));
        await db.update(articles).set({ likes: (await db.query.articles.findFirst({ where: eq(articles.id, input.articleId) }))!.likes - 1 }).where(eq(articles.id, input.articleId));
        return { liked: false };
      } else {
        await db.insert(reactions).values({ articleId: input.articleId, userId: input.userId, type: "like" });
        await db.update(articles).set({ likes: (await db.query.articles.findFirst({ where: eq(articles.id, input.articleId) }))!.likes + 1 }).where(eq(articles.id, input.articleId));
        return { liked: true };
      }
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const results = await db.query.articles.findMany({
        where: or(like(articles.title, `%${input.query}%`), like(articles.content, `%${input.query}%`)),
        with: { author: true },
        limit: 20,
      });
      return results;
    }),
});
