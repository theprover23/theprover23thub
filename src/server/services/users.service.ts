import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const usersRouter = router({
  // Get user profile by ID
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(schema.users.id, input.userId),
        with: {
          articles: {
            columns: { id: true, title: true, published: true, createdAt: true },
            limit: 5,
          },
          achievements: {
            with: {
              achievement: true,
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),

  // Get current user profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(schema.users.id, ctx.user.id),
    });

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50).optional(),
        bio: z.string().max(500).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.image !== undefined) updateData.image = input.image;

      const updated = await ctx.db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, ctx.user.id))
        .returning();

      return updated[0];
    }),

  // Subscribe to user
  subscribe: protectedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetUserId === ctx.user.id) {
        throw new Error('Cannot subscribe to yourself');
      }

      const now = new Date().toISOString();

      const existing = await ctx.db.query.subscriptions.findFirst({
        where: and(
          eq(schema.subscriptions.followerId, ctx.user.id),
          eq(schema.subscriptions.followingId, input.targetUserId)
        ),
      });

      if (existing) {
        throw new Error('Already subscribed');
      }

      await ctx.db.insert(schema.subscriptions).values({
        followerId: ctx.user.id,
        followingId: input.targetUserId,
        createdAt: now,
      });

      // Create notification
      await ctx.db.insert(schema.notifications).values({
        userId: input.targetUserId,
        type: 'subscription',
        title: 'New follower',
        message: 'Someone started following you',
        link: `/profile/${ctx.user.id}`,
        createdAt: now,
      });

      return { success: true };
    }),

  // Unsubscribe from user
  unsubscribe: protectedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(schema.subscriptions)
        .where(and(
          eq(schema.subscriptions.followerId, ctx.user.id),
          eq(schema.subscriptions.followingId, input.targetUserId)
        ));

      return { success: true };
    }),

  // Get user's subscribers
  getSubscribers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscriptions = await ctx.db.query.subscriptions.findMany({
        where: eq(schema.subscriptions.followingId, input.userId),
        with: {
          follower: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      return subscriptions.map(s => s.follower);
    }),

  // Get users who the user is following
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscriptions = await ctx.db.query.subscriptions.findMany({
        where: eq(schema.subscriptions.followerId, input.userId),
        with: {
          following: {
            columns: { id: true, name: true, image: true },
          },
        },
      });

      return subscriptions.map(s => s.following);
    }),

  // Search users
  searchUsers: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`;

      const users = await ctx.db.query.users.findMany({
        where: like(schema.users.name, searchTerm),
        limit: input.limit,
        columns: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      });

      return users;
    }),

  // Get user statistics
  getUserStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const articlesCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.articles)
        .where(eq(schema.articles.authorId, input.userId));

      const commentsCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.comments)
        .where(eq(schema.comments.authorId, input.userId));

      const reactionsReceived = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.reactions)
        .leftJoin(schema.articles, eq(schema.reactions.articleId, schema.articles.id))
        .where(eq(schema.articles.authorId, input.userId));

      return {
        articlesCount: Number(articlesCount[0]?.count || 0),
        commentsCount: Number(commentsCount[0]?.count || 0),
        reactionsReceived: Number(reactionsReceived[0]?.count || 0),
      };
    }),
});

// Helper for LIKE operator
function like(column: any, pattern: string) {
  return sql`${column} LIKE ${pattern}`;
}
