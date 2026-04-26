import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { eq, desc, and, sql } from 'drizzle-orm';
import * as schema from '../../db/schema';

export const notificationsRouter = router({
  // Get user notifications
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      let whereClause = eq(schema.notifications.userId, ctx.user.id);
      
      if (input.unreadOnly) {
        whereClause = and(whereClause, eq(schema.notifications.isRead, false));
      }

      const notifications = await ctx.db.query.notifications.findMany({
        where: whereClause,
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(schema.notifications.createdAt)],
      });

      return notifications;
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(schema.notifications.id, input.notificationId),
          eq(schema.notifications.userId, ctx.user.id)
        ),
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await ctx.db
        .update(schema.notifications)
        .set({ isRead: true })
        .where(eq(schema.notifications.id, input.notificationId));

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, ctx.user.id));

    return { success: true };
  }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.userId, ctx.user.id),
        eq(schema.notifications.isRead, false)
      ));

    return { count: Number(result[0]?.count || 0) };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(schema.notifications.id, input.notificationId),
          eq(schema.notifications.userId, ctx.user.id)
        ),
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await ctx.db.delete(schema.notifications).where(eq(schema.notifications.id, input.notificationId));
      return { success: true };
    }),
});
