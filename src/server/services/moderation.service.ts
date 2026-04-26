import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, moderatorProcedure, adminProcedure } from '../trpc';
import { eq, desc, and, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const moderationRouter = router({
  // Get all reports (moderator+)
  getReports: moderatorProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'reviewed', 'resolved']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let whereClause;
      if (input.status) {
        whereClause = eq(schema.reports.status, input.status);
      }

      const reports = await ctx.db.query.reports.findMany({
        where: whereClause,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(schema.reports.createdAt)],
        with: {
          reporter: {
            columns: { id: true, name: true },
          },
          reportedUser: {
            columns: { id: true, name: true },
          },
          moderator: {
            columns: { id: true, name: true },
          },
        },
      });

      return reports;
    }),

  // Create report
  createReport: protectedProcedure
    .input(
      z.object({
        reportedUserId: z.string().optional(),
        contentType: z.enum(['article', 'comment', 'forum_thread', 'meme', 'user']),
        contentId: z.number().optional(),
        reason: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      const report = await ctx.db.insert(schema.reports).values({
        reporterId: ctx.user.id,
        reportedUserId: input.reportedUserId,
        contentType: input.contentType,
        contentId: input.contentId,
        reason: input.reason,
        createdAt: now,
      }).returning();

      return report[0];
    }),

  // Resolve report
  resolveReport: moderatorProcedure
    .input(
      z.object({
        reportId: z.number(),
        action: z.enum(['approve', 'reject', 'delete_content', 'ban_user']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.query.reports.findFirst({
        where: eq(schema.reports.id, input.reportId),
      });

      if (!report) {
        throw new Error('Report not found');
      }

      const now = new Date().toISOString();

      // Update report status
      await ctx.db
        .update(schema.reports)
        .set({
          status: 'resolved',
          moderatorId: ctx.user.id,
          resolvedAt: now,
        })
        .where(eq(schema.reports.id, input.reportId));

      // Log the moderation action
      await ctx.db.insert(schema.moderationLogs).values({
        moderatorId: ctx.user.id,
        action: input.action,
        targetUserId: report.reportedUserId,
        targetType: report.contentType,
        targetId: report.contentId,
        reason: input.reason,
        createdAt: now,
      });

      // Perform the action
      switch (input.action) {
        case 'delete_content':
          if (report.contentType === 'article' && report.contentId) {
            await ctx.db.delete(schema.articles).where(eq(schema.articles.id, report.contentId));
          } else if (report.contentType === 'comment' && report.contentId) {
            await ctx.db.delete(schema.comments).where(eq(schema.comments.id, report.contentId));
          } else if (report.contentType === 'forum_thread' && report.contentId) {
            await ctx.db.delete(schema.forumThreads).where(eq(schema.forumThreads.id, report.contentId));
          } else if (report.contentType === 'meme' && report.contentId) {
            await ctx.db.delete(schema.memes).where(eq(schema.memes.id, report.contentId));
          }
          break;

        case 'ban_user':
          if (report.reportedUserId) {
            await ctx.db
              .update(schema.users)
              .set({ isBanned: true })
              .where(eq(schema.users.id, report.reportedUserId));
          }
          break;
      }

      return { success: true };
    }),

  // Ban user (admin only)
  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      await ctx.db
        .update(schema.users)
        .set({ isBanned: true })
        .where(eq(schema.users.id, input.userId));

      await ctx.db.insert(schema.moderationLogs).values({
        moderatorId: ctx.user.id,
        action: 'ban',
        targetUserId: input.userId,
        reason: input.reason,
        createdAt: now,
      });

      return { success: true };
    }),

  // Unban user (admin only)
  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      await ctx.db
        .update(schema.users)
        .set({ isBanned: false })
        .where(eq(schema.users.id, input.userId));

      await ctx.db.insert(schema.moderationLogs).values({
        moderatorId: ctx.user.id,
        action: 'unban',
        targetUserId: input.userId,
        createdAt: now,
      });

      return { success: true };
    }),

  // Get moderation logs (admin only)
  getModerationLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.query.moderationLogs.findMany({
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(schema.moderationLogs.createdAt)],
        with: {
          moderator: {
            columns: { id: true, name: true },
          },
          targetUser: {
            columns: { id: true, name: true },
          },
        },
      });

      return logs;
    }),

  // Delete content (moderator+)
  deleteContent: moderatorProcedure
    .input(
      z.object({
        contentType: z.enum(['article', 'comment', 'forum_thread', 'meme']),
        contentId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      switch (input.contentType) {
        case 'article':
          await ctx.db.delete(schema.articles).where(eq(schema.articles.id, input.contentId));
          break;
        case 'comment':
          await ctx.db.delete(schema.comments).where(eq(schema.comments.id, input.contentId));
          break;
        case 'forum_thread':
          await ctx.db.delete(schema.forumThreads).where(eq(schema.forumThreads.id, input.contentId));
          break;
        case 'meme':
          await ctx.db.delete(schema.memes).where(eq(schema.memes.id, input.contentId));
          break;
      }

      await ctx.db.insert(schema.moderationLogs).values({
        moderatorId: ctx.user.id,
        action: 'delete_content',
        targetType: input.contentType,
        targetId: input.contentId,
        reason: input.reason,
        createdAt: now,
      });

      return { success: true };
    }),
});
