import { z } from "zod";
import { db } from "@server/db";
import { users, subscriptions, notifications, userAchievements, achievements } from "@server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
        with: { 
          articles: true,
          comments: true,
          achievements: { with: { achievement: true } },
        },
      });
      if (!user) throw new Error("User not found");
      return user;
    }),

  updateProfile: publicProcedure
    .input(z.object({
      id: z.string(),
      bio: z.string().optional(),
      notificationSettings: z.object({
        comments: z.boolean().optional(),
        replies: z.boolean().optional(),
        mentions: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return updated[0];
    }),

  subscribe: publicProcedure
    .input(z.object({ followerId: z.string(), followingId: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.followerId, input.followerId),
          eq(subscriptions.followingId, input.followingId)
        ),
      });

      if (existing) {
        await db.delete(subscriptions).where(eq(subscriptions.id, existing.id));
        return { subscribed: false };
      } else {
        await db.insert(subscriptions).values(input);
        return { subscribed: true };
      }
    }),

  getSubscribers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.subscriptions.findMany({
        where: eq(subscriptions.followingId, input.userId),
        with: { follower: true },
      });
    }),

  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.subscriptions.findMany({
        where: eq(subscriptions.followerId, input.userId),
        with: { following: true },
      });
    }),

  getNotifications: publicProcedure
    .input(z.object({ userId: z.string(), unreadOnly: z.boolean().default(false) }))
    .query(async ({ input }) => {
      const conditions = [eq(notifications.userId, input.userId)];
      if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));

      return await db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: desc(notifications.createdAt),
        limit: 50,
      });
    }),

  markNotificationAsRead: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllNotificationsAsRead: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, input.userId));
      return { success: true };
    }),

  getAchievements: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, input.userId),
        with: { achievement: true },
      });
    }),

  awardAchievement: publicProcedure
    .input(z.object({ userId: z.string(), achievementId: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, input.userId),
          eq(userAchievements.achievementId, input.achievementId)
        ),
      });

      if (!existing) {
        await db.insert(userAchievements).values(input);
      }
      return { success: true };
    }),
});
