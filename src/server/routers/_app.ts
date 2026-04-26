import { articleRouter } from "./article";
import { commentRouter } from "./comment";
import { forumRouter } from "./forum";
import { memeRouter } from "./meme";
import { userRouter } from "./user";
import { moderationRouter } from "./moderation";
import { createTRPCRouter } from "@server/trpc";

export const appRouter = createTRPCRouter({
  article: articleRouter,
  comment: commentRouter,
  forum: forumRouter,
  meme: memeRouter,
  user: userRouter,
  moderation: moderationRouter,
});

export type AppRouter = typeof appRouter;
