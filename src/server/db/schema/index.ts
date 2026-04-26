import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  bio: text("bio"),
  stats: text("stats").$type<{ articles: number; comments: number; likes: number; achievements: string[] }>().default('{"articles":0,"comments":0,"likes":0,"achievements":[]}'),
  isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
  notificationSettings: text("notification_settings").$type<{ comments: boolean; replies: boolean; mentions: boolean }>().default('{"comments":true,"replies":true,"mentions":true}'),
  rating: integer("rating").default(0), // Rating system for activity
  theme: text("theme", { enum: ["light", "dark"] }).default("dark"), // Theme preference
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Supports HTML with images
  excerpt: text("excerpt"),
  authorId: text("author_id").notNull().references(() => users.id),
  coverImage: text("cover_image"),
  images: text("images").$type<string[]>().default('[]'), // Array of image URLs
  tags: text("tags").$type<string[]>().default('[]'),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  isPublished: integer("is_published", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  articleId: text("article_id").references(() => articles.id, { onDelete: "cascade" }),
  forumThreadId: text("forum_thread_id").references(() => forumThreads.id, { onDelete: "cascade" }),
  memeId: text("meme_id").references(() => memes.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references((self: any) => self.id, { onDelete: "cascade" }),
  likes: integer("likes").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  articleId: text("article_id").references(() => articles.id, { onDelete: "cascade" }),
  commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  forumThreadId: text("forum_thread_id").references(() => forumThreads.id, { onDelete: "cascade" }),
  forumPostId: text("forum_post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  memeId: text("meme_id").references(() => memes.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const forumCategories = sqliteTable("forum_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const forumThreads = sqliteTable("forum_threads", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Supports HTML with images
  authorId: text("author_id").notNull().references(() => users.id),
  categoryId: text("category_id").notNull().references(() => forumCategories.id),
  images: text("images").$type<string[]>().default('[]'), // Array of image URLs
  tags: text("tags").$type<string[]>().default('[]'),
  views: integer("views").default(0),
  repliesCount: integer("replies_count").default(0),
  isLocked: integer("is_locked", { mode: "boolean" }).default(false),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  solvedPostId: text("solved_post_id").references(() => forumPosts.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const forumPosts = sqliteTable("forum_posts", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  threadId: text("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references((self: any) => self.id, { onDelete: "cascade" }),
  likes: integer("likes").default(0),
  isSolution: integer("is_solution", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const memes = sqliteTable("memes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  tags: text("tags").$type<string[]>().default('[]'),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").notNull().references(() => users.id),
  followingId: text("following_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  condition: text("condition").notNull(),
  points: integer("points").default(0),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull().references(() => achievements.id),
  earnedAt: integer("earned_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  reportedUserId: text("reported_user_id").references(() => users.id),
  articleId: text("article_id").references(() => articles.id),
  commentId: text("comment_id").references(() => comments.id),
  forumThreadId: text("forum_thread_id").references(() => forumThreads.id),
  forumPostId: text("forum_post_id").references(() => forumPosts.id),
  memeId: text("meme_id").references(() => memes.id),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  moderatorId: text("moderator_id").references(() => users.id),
  moderatorNote: text("moderator_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const moderationLogs = sqliteTable("moderation_logs", {
  id: text("id").primaryKey(),
  moderatorId: text("moderator_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  userId: text("user_id").references(() => users.id),
  metadata: text("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const searchQueries = sqliteTable("search_queries", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  userId: text("user_id").references(() => users.id),
  resultsCount: integer("results_count"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
