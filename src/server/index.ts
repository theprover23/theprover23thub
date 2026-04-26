import { router } from './trpc';
import { articlesRouter } from './services/articles.service';
import { forumRouter } from './services/forum.service';
import { memesRouter } from './services/memes.service';
import { moderationRouter } from './services/moderation.service';
import { notificationsRouter } from './services/notifications.service';
import { usersRouter } from './services/users.service';

export const appRouter = router({
  articles: articlesRouter,
  forum: forumRouter,
  memes: memesRouter,
  moderation: moderationRouter,
  notifications: notificationsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
