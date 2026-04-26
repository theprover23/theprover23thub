import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, moderatorProcedure, adminProcedure } from '../trpc';
import { eq, desc, and, like, or } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const memesRouter = router({
  // Get all memes with pagination
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        sortBy: z.enum(['newest', 'popular']).default('newest'),
      })
    )
    .query(async ({ ctx, input }) => {
      let orderBy;
      if (input.sortBy === 'popular') {
        orderBy = desc(schema.memes.views);
      } else {
        orderBy = desc(schema.memes.createdAt);
      }

      const memes = await ctx.db.query.memes.findMany({
        limit: input.limit,
        offset: input.offset,
        orderBy,
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
          reactions: {
            columns: { type: true },
          },
        },
      });

      return memes;
    }),

  // Get meme by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const meme = await ctx.db.query.memes.findFirst({
        where: eq(schema.memes.id, input.id),
        with: {
          author: {
            columns: { id: true, name: true, image: true, bio: true },
          },
          comments: {
            orderBy: [desc(schema.comments.createdAt)],
            with: {
              author: {
                columns: { id: true, name: true, image: true },
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

      if (!meme) {
        throw new Error('Meme not found');
      }

      // Increment views
      await ctx.db
        .update(schema.memes)
        .set({ views: (meme.views || 0) + 1 })
        .where(eq(schema.memes.id, input.id));

      return meme;
    }),

  // Create meme
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const meme = await ctx.db.insert(schema.memes).values({
        title: input.title,
        imageUrl: input.imageUrl,
        authorId: ctx.user.id,
        createdAt: now,
      }).returning();

      return meme[0];
    }),

  // Delete meme
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const meme = await ctx.db.query.memes.findFirst({
        where: eq(schema.memes.id, input.id),
      });

      if (!meme) {
        throw new Error('Meme not found');
      }

      if (meme.authorId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
        throw new Error('Unauthorized');
      }

      await ctx.db.delete(schema.memes).where(eq(schema.memes.id, input.id));
      return { success: true };
    }),

  // Add reaction to meme
  addReaction: protectedProcedure
    .input(
      z.object({
        memeId: z.number(),
        type: z.enum(['like', 'love', 'laugh', 'thinking']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const existing = await ctx.db.query.reactions.findFirst({
        where: and(
          eq(schema.reactions.memeId, input.memeId),
          eq(schema.reactions.userId, ctx.user.id)
        ),
      });

      if (existing) {
        await ctx.db
          .update(schema.reactions)
          .set({ type: input.type })
          .where(eq(schema.reactions.id, existing.id));
        return existing;
      }

      const reaction = await ctx.db.insert(schema.reactions).values({
        type: input.type,
        userId: ctx.user.id,
        memeId: input.memeId,
        createdAt: now,
      }).returning();

      return reaction[0];
    }),

  // Add comment to meme
  addComment: protectedProcedure
    .input(
      z.object({
        memeId: z.number(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const comment = await ctx.db.insert(schema.comments).values({
        content: input.content,
        authorId: ctx.user.id,
        memeId: input.memeId,
        createdAt: now,
      }).returning();

      const meme = await ctx.db.query.memes.findFirst({
        where: eq(schema.memes.id, input.memeId),
      });

      if (meme && meme.authorId !== ctx.user.id) {
        await ctx.db.insert(schema.notifications).values({
          userId: meme.authorId,
          type: 'comment',
          title: 'New comment on your meme',
          message: `Someone commented on "${meme.title}"`,
          link: `/memes/${meme.id}`,
          createdAt: now,
        });
      }

      return comment[0];
    }),

  // Search memes
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`;

      const memes = await ctx.db.query.memes.findMany({
        where: like(schema.memes.title, searchTerm),
        limit: input.limit,
        orderBy: [desc(schema.memes.createdAt)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      return memes;
    }),

  // Get popular memes
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      const memes = await ctx.db.query.memes.findMany({
        limit: input.limit,
        orderBy: [desc(schema.memes.views)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      return memes;
    }),
});
