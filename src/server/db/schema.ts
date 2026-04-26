import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  image: text('image'),
  role: text('role').default('user'), // user, moderator, admin
  isBanned: integer('is_banned', { mode: 'boolean' }).default(false),
  bio: text('bio'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// Articles table
export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  published: integer('published', { mode: 'boolean' }).default(false),
  views: integer('views').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Comments table
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  forumThreadId: integer('forum_thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }),
  memeId: integer('meme_id').references(() => memes.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references(() => comments.id, { onDelete: 'cascade' }),
  isSolution: integer('is_solution', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Reactions table (likes, etc.)
export const reactions = sqliteTable('reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // like, love, laugh, etc.
  userId: text('user_id').notNull().references(() => users.id),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  forumThreadId: integer('forum_thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }),
  memeId: integer('meme_id').references(() => memes.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

// Forum categories table
export const forumCategories = sqliteTable('forum_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').default(0),
});

// Forum threads table
export const forumThreads = sqliteTable('forum_threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  categoryId: integer('category_id').references(() => forumCategories.id),
  isClosed: integer('is_closed', { mode: 'boolean' }).default(false),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  views: integer('views').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Thread tags table
export const threadTags = sqliteTable('thread_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').default('#3b82f6'),
});

// Thread-tag relations
export const threadTagRelations = sqliteTable('thread_tag_relations', {
  threadId: integer('thread_id').notNull().references(() => forumThreads.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => threadTags.id, { onDelete: 'cascade' }),
});

// Memes table
export const memes = sqliteTable('memes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  views: integer('views').default(0),
  createdAt: text('created_at').notNull(),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // comment, reply, like, mention, system
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Subscriptions table
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  followerId: text('follower_id').notNull().references(() => users.id),
  followingId: text('following_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Achievements table
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  requirement: integer('requirement').default(1),
  type: text('type').notNull(), // posts, comments, likes, days_active
});

// User achievements table
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id),
  progress: integer('progress').default(0),
  unlockedAt: text('unlocked_at'),
});

// Reports table (moderation)
export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  reportedUserId: text('reported_user_id').references(() => users.id),
  contentType: text('content_type').notNull(), // article, comment, forum_thread, meme, user
  contentId: integer('content_id'),
  reason: text('reason').notNull(),
  status: text('status').default('pending'), // pending, reviewed, resolved
  moderatorId: text('moderator_id').references(() => users.id),
  resolvedAt: text('resolved_at'),
  createdAt: text('created_at').notNull(),
});

// Moderation logs table
export const moderationLogs = sqliteTable('moderation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  moderatorId: text('moderator_id').notNull().references(() => users.id),
  action: text('action').notNull(), // ban, unban, delete_content, warn
  targetUserId: text('target_user_id').references(() => users.id),
  targetType: text('target_type'), // user, article, comment, forum_thread, meme
  targetId: integer('target_id'),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
});

// Analytics table
export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(),
  userId: text('user_id').references(() => users.id),
  page: text('page'),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull(),
});

// Media files table
export const mediaFiles = sqliteTable('media_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  createdAt: text('created_at').notNull(),
});

// Search queries table
export const searchQueries = sqliteTable('search_queries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  userId: text('user_id').references(() => users.id),
  resultsCount: integer('results_count').default(0),
  createdAt: text('created_at').notNull(),
});
