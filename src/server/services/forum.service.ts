import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, moderatorProcedure } from '../trpc';
import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const forumRouter = router({
  // Get all categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.query.forumCategories.findMany({
      orderBy: [asc(schema.forumCategories.order)],
      with: {
        threads: {
          limit: 3,
          orderBy: [desc(schema.forumThreads.createdAt)],
          with: {
            author: {
              columns: { id: true, name: true, image: true },
            },
            replies: {
              columns: { id: true },
            },
          },
        },
      },
    });

    return categories;
  }),

  // Get threads by category
  getThreadsByCategory: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        sortBy: z.enum(['newest', 'oldest', 'mostViewed', 'mostReplied']).default('newest'),
      })
    )
    .query(async ({ ctx, input }) => {
      let orderBy;
      switch (input.sortBy) {
        case 'oldest':
          orderBy = asc(schema.forumThreads.createdAt);
          break;
        case 'mostViewed':
          orderBy = desc(schema.forumThreads.views);
          break;
        case 'mostReplied':
          orderBy = desc(sql`SELECT COUNT(*) FROM ${schema.comments} WHERE ${schema.comments.forumThreadId} = ${schema.forumThreads.id}`);
          break;
        default:
          orderBy = desc(schema.forumThreads.createdAt);
      }

      const threads = await ctx.db.query.forumThreads.findMany({
        where: eq(schema.forumThreads.categoryId, input.categoryId),
        limit: input.limit,
        offset: input.offset,
        orderBy,
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
          tags: {
            with: {
              tag: {
                columns: { id: true, name: true, color: true },
              },
            },
          },
          replies: {
            columns: { id: true },
          },
        },
      });

      return threads;
    }),

  // Get thread by ID
  getThreadById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.query.forumThreads.findFirst({
        where: eq(schema.forumThreads.id, input.id),
        with: {
          author: {
            columns: { id: true, name: true, image: true, bio: true },
          },
          category: true,
          tags: {
            with: {
              tag: true,
            },
          },
          replies: {
            orderBy: [asc(schema.comments.createdAt)],
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
        },
      });

      if (!thread) {
        throw new Error('Thread not found');
      }

      // Increment views
      await ctx.db
        .update(schema.forumThreads)
        .set({ views: (thread.views || 0) + 1 })
        .where(eq(schema.forumThreads.id, input.id));

      return thread;
    }),

  // Create thread
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        categoryId: z.number(),
        tagIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const thread = await ctx.db.insert(schema.forumThreads).values({
        title: input.title,
        content: input.content,
        authorId: ctx.user.id,
        categoryId: input.categoryId,
        createdAt: now,
        updatedAt: now,
      }).returning();

      // Add tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        await ctx.db.insert(schema.threadTagRelations).values(
          input.tagIds.map(tagId => ({
            threadId: thread[0].id,
            tagId,
          }))
        );
      }

      return thread[0];
    }),

  // Reply to thread
  replyToThread: protectedProcedure
    .input(
      z.object({
        threadId: z.number(),
        content: z.string().min(1).max(5000),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const thread = await ctx.db.query.forumThreads.findFirst({
        where: eq(schema.forumThreads.id, input.threadId),
      });

      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.isClosed) {
        throw new Error('This thread is closed');
      }

      const comment = await ctx.db.insert(schema.comments).values({
        content: input.content,
        authorId: ctx.user.id,
        forumThreadId: input.threadId,
        parentId: input.parentId,
        createdAt: now,
      }).returning();

      // Create notification for thread author
      if (thread.authorId !== ctx.user.id) {
        await ctx.db.insert(schema.notifications).values({
          userId: thread.authorId,
          type: 'reply',
          title: 'New reply in your thread',
          message: `Someone replied to "${thread.title}"`,
          link: `/forum/threads/${thread.id}`,
          createdAt: now,
        });
      }

      return comment[0];
    }),

  // Mark comment as solution
  markAsSolution: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(schema.comments.id, input.commentId),
        with: {
          forumThread: true,
        },
      });

      if (!comment || !comment.forumThread) {
        throw new Error('Comment not found');
      }

      if (comment.forumThread.authorId !== ctx.user.id && ctx.user.role !== 'moderator' && ctx.user.role !== 'admin') {
        throw new Error('Only the thread author or a moderator can mark a solution');
      }

      // Unmark other solutions in the same thread
      await ctx.db
        .update(schema.comments)
        .set({ isSolution: false })
        .where(eq(schema.comments.forumThreadId, comment.forumThread!.id));

      // Mark this comment as solution
      await ctx.db
        .update(schema.comments)
        .set({ isSolution: true })
        .where(eq(schema.comments.id, input.commentId));

      return { success: true };
    }),

  // Close thread
  closeThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.query.forumThreads.findFirst({
        where: eq(schema.forumThreads.id, input.threadId),
      });

      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.authorId !== ctx.user.id && ctx.user.role !== 'moderator' && ctx.user.role !== 'admin') {
        throw new Error('Only the thread author or a moderator can close the thread');
      }

      await ctx.db
        .update(schema.forumThreads)
        .set({ isClosed: true })
        .where(eq(schema.forumThreads.id, input.threadId));

      return { success: true };
    }),

  // Search threads
  searchThreads: publicProcedure
    .input(
      z.object({
        query: z.string(),
        categoryId: z.number().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`;

      let whereClause = or(
        like(schema.forumThreads.title, searchTerm),
        like(schema.forumThreads.content, searchTerm)
      );

      if (input.categoryId) {
        whereClause = and(whereClause, eq(schema.forumThreads.categoryId, input.categoryId));
      }

      const threads = await ctx.db.query.forumThreads.findMany({
        where: whereClause,
        limit: input.limit,
        orderBy: [desc(schema.forumThreads.createdAt)],
        with: {
          author: {
            columns: { id: true, name: true, image: true },
          },
          category: true,
        },
      });

      return threads;
    }),

  // Get all tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.query.threadTags.findMany({
      orderBy: [asc(schema.threadTags.name)],
    });
    return tags;
  }),

  // Create tag (moderator only)
  createTag: moderatorProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().default('#3b82f6'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.insert(schema.threadTags).values({
        name: input.name,
        color: input.color,
      }).returning();
      return tag[0];
    }),
});
