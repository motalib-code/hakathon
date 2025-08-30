import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["draft", "pending", "approved", "rejected"] }).default("draft"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  aiSentiment: varchar("ai_sentiment", { enum: ["positive", "neutral", "negative"] }),
  aiScore: integer("ai_score"), // 0-100
  aiAnalysis: text("ai_analysis"),
  rejectionReason: text("rejection_reason"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  blogId: varchar("blog_id").notNull().references(() => blogs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blogId: varchar("blog_id").notNull().references(() => blogs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  blogs: many(blogs),
  comments: many(comments),
  likes: many(likes),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  blog: one(blogs, {
    fields: [comments.blogId],
    references: [blogs.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  blog: one(blogs, {
    fields: [likes.blogId],
    references: [blogs.id],
  }),
}));

// Insert schemas
export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  views: true,
  likes: true,
  aiSentiment: true,
  aiScore: true,
  aiAnalysis: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Blog = typeof blogs.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
