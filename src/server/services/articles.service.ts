import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { eq, desc, asc, like, and, or, count, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const articlesRouter = router({
  // Get all articles with pagination
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        publishedOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.publishedOnly 
        ? and(eq(schema.articles.published, true))
        : undefined;
      
      const articles = await ctx.db.query.articles.findMany({
        where,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(schema.articles.createdAt)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      });

      return articles;
    }),

  // Get article by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.query.articles.findFirst({
        where: eq(schema.articles.id, input.id),
        with: {
          author: {
            columns: { id: true, name: true, image: true, bio: true },
          },
          comments: {
            with: {
              author: {
                columns: { id: true, name: true, image: true },
              },
              reactions: {
                with: {
                  user: {
                    columns: { id: true, name: true },
                  },
                },
              },
            },
          },
          reactions: {
            with: {
              user: {
                columns: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment views
      await ctx.db
        .update(schema.articles)
        .set({ views: (article.views || 0) + 1 })
        .where(eq(schema.articles.id, input.id));

      return article;
    }),

  // Create article
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      
      const article = await ctx.db.insert(schema.articles).values({
        title: input.title,
        content: input.content,
        authorId: ctx.user.id,
        published: input.published,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return article[0];
    }),

  // Update article
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.db.query.articles.findFirst({
        where: eq(schema.articles.id, input.id),
      });

      if (!article) {
        throw new Error('Article not found');
      }

      if (article.authorId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
        throw new Error('Unauthorized');
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.published !== undefined) updateData.published = input.published;

      const updated = await ctx.db
        .update(schema.articles)
        .set(updateData)
        .where(eq(schema.articles.id, input.id))
        .returning();

      return updated[0];
    }),

  // Delete article
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.db.query.articles.findFirst({
        where: eq(schema.articles.id, input.id),
      });

      if (!article) {
        throw new Error('Article not found');
      }

      if (article.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      await ctx.db.delete(schema.articles).where(eq(schema.articles.id, input.id));
      return { success: true };
    }),

  // Add comment to article
  addComment: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        content: z.string().min(1).max(5000),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      
      const comment = await ctx.db.insert(schema.comments).values({
        content: input.content,
        authorId: ctx.user.id,
        articleId: input.articleId,
        parentId: input.parentId,
        createdAt: now,
      }).returning();

      // Create notification for article author
      const article = await ctx.db.query.articles.findFirst({
        where: eq(schema.articles.id, input.articleId),
      });
      
      if (article && article.authorId !== ctx.user.id) {
        await ctx.db.insert(schema.notifications).values({
          userId: article.authorId,
          type: 'comment',
          title: 'New comment on your article',
          message: `Someone commented on "${article.title}"`,
          link: `/articles/${article.id}`,
          createdAt: now,
        });
      }

      return comment[0];
    }),

  // Add reaction to article
  addReaction: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        type: z.enum(['like', 'love', 'laugh', 'thinking']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      
      // Check if user already reacted
      const existing = await ctx.db.query.reactions.findFirst({
        where: and(
          eq(schema.reactions.articleId, input.articleId),
          eq(schema.reactions.userId, ctx.user.id)
        ),
      });

      if (existing) {
        // Update existing reaction
        await ctx.db
          .update(schema.reactions)
          .set({ type: input.type })
          .where(eq(schema.reactions.id, existing.id));
        return existing;
      }

      const reaction = await ctx.db.insert(schema.reactions).values({
        type: input.type,
        userId: ctx.user.id,
        articleId: input.articleId,
        createdAt: now,
      }).returning();

      // Create notification for article author
      const article = await ctx.db.query.articles.findFirst({
        where: eq(schema.articles.id, input.articleId),
      });
      
      if (article && article.authorId !== ctx.user.id) {
        await ctx.db.insert(schema.notifications).values({
          userId: article.authorId,
          type: 'like',
          title: `New ${input.type} on your article`,
          message: `Someone ${input.type}d "${article.title}"`,
          link: `/articles/${article.id}`,
          createdAt: now,
        });
      }

      return reaction[0];
    }),

  // Search articles
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`;
      
      const articles = await ctx.db.query.articles.findMany({
        where: and(
          eq(schema.articles.published, true),
          or(
            like(schema.articles.title, searchTerm),
            like(schema.articles.content, searchTerm)
          )
        ),
        limit: input.limit,
        orderBy: [desc(schema.articles.createdAt)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      // Log search query
      await ctx.db.insert(schema.searchQueries).values({
        query: input.query,
        resultsCount: articles.length,
        createdAt: new Date().toISOString(),
      });

      return articles;
    }),

  // Get popular articles
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const articles = await ctx.db.query.articles.findMany({
        where: eq(schema.articles.published, true),
        limit: input.limit,
        orderBy: [desc(schema.articles.views)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      return articles;
    }),
});
