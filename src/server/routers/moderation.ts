import { z } from "zod";
import { db } from "@server/db";
import { reports, moderationLogs, users, articles, comments, forumThreads, forumPosts, memes } from "@server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

export const moderationRouter = createTRPCRouter({
  getReports: publicProcedure
    .input(z.object({ status: z.enum(["pending", "resolved", "all"]).default("pending") }))
    .query(async ({ input }) => {
      const conditions = input.status !== "all" ? [eq(reports.status, input.status)] : [];
      
      return await db.query.reports.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          reporter: true,
          reportedUser: true,
          article: true,
          comment: true,
          forumThread: true,
          forumPost: true,
          meme: true,
          moderator: true,
        },
        orderBy: desc(reports.createdAt),
      });
    }),

  createReport: publicProcedure
    .input(z.object({
      reporterId: z.string(),
      reportedUserId: z.string().optional(),
      articleId: z.string().optional(),
      commentId: z.string().optional(),
      forumThreadId: z.string().optional(),
      forumPostId: z.string().optional(),
      memeId: z.string().optional(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const newReport = await db.insert(reports).values({
        ...input,
        status: "pending",
      }).returning();
      return newReport[0];
    }),

  resolveReport: publicProcedure
    .input(z.object({
      reportId: z.string(),
      moderatorId: z.string(),
      action: z.enum(["approve", "reject", "ban", "delete"]),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const report = await db.query.reports.findFirst({ where: eq(reports.id, input.reportId) });
      if (!report) throw new Error("Report not found");

      await db.update(reports).set({
        status: "resolved",
        moderatorId: input.moderatorId,
        moderatorNote: input.note,
        resolvedAt: new Date(),
      }).where(eq(reports.id, input.reportId));

      if (input.action === "ban" && report.reportedUserId) {
        await db.update(users).set({ isBlocked: true }).where(eq(users.id, report.reportedUserId));
      }

      if (input.action === "delete") {
        if (report.articleId) await db.delete(articles).where(eq(articles.id, report.articleId));
        if (report.commentId) await db.delete(comments).where(eq(comments.id, report.commentId));
        if (report.forumThreadId) await db.delete(forumThreads).where(eq(forumThreads.id, report.forumThreadId));
        if (report.forumPostId) await db.delete(forumPosts).where(eq(forumPosts.id, report.forumPostId));
        if (report.memeId) await db.delete(memes).where(eq(memes.id, report.memeId));
      }

      await db.insert(moderationLogs).values({
        moderatorId: input.moderatorId,
        action: input.action,
        targetType: "report",
        targetId: input.reportId,
        reason: input.note,
      });

      return { success: true };
    }),

  blockUser: publicProcedure
    .input(z.object({ moderatorId: z.string(), userId: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(users).set({ isBlocked: true }).where(eq(users.id, input.userId));
      
      await db.insert(moderationLogs).values({
        moderatorId: input.moderatorId,
        action: "block",
        targetType: "user",
        targetId: input.userId,
        reason: input.reason,
      });

      return { success: true };
    }),

  unblockUser: publicProcedure
    .input(z.object({ moderatorId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(users).set({ isBlocked: false }).where(eq(users.id, input.userId));
      
      await db.insert(moderationLogs).values({
        moderatorId: input.moderatorId,
        action: "unblock",
        targetType: "user",
        targetId: input.userId,
      });

      return { success: true };
    }),

  getModerationLogs: publicProcedure
    .input(z.object({ moderatorId: z.string().optional() }))
    .query(async ({ input }) => {
      const conditions = input.moderatorId ? [eq(moderationLogs.moderatorId, input.moderatorId)] : [];
      
      return await db.query.moderationLogs.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: { moderator: true },
        orderBy: desc(moderationLogs.createdAt),
        limit: 100,
      });
    }),
});
