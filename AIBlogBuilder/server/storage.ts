import {
  users,
  blogs,
  comments,
  likes,
  type User,
  type UpsertUser,
  type Blog,
  type InsertBlog,
  type Comment,
  type InsertComment,
  type Like,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql, or, like } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Blog operations
  createBlog(blog: InsertBlog): Promise<Blog>;
  getBlog(id: string): Promise<Blog | undefined>;
  getBlogWithAuthor(id: string): Promise<any>;
  getUserBlogs(userId: string): Promise<Blog[]>;
  getAllBlogs(status?: string): Promise<any[]>;
  getPendingBlogs(): Promise<any[]>;
  getTrendingBlogs(limit?: number): Promise<any[]>;
  updateBlogStatus(id: string, status: string, rejectionReason?: string): Promise<void>;
  updateBlogAIAnalysis(id: string, sentiment: string, score: number, analysis: string): Promise<void>;
  incrementBlogViews(id: string): Promise<void>;
  searchBlogs(query: string): Promise<any[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getBlogComments(blogId: string): Promise<any[]>;
  
  // Like operations
  toggleLike(userId: string, blogId: string): Promise<boolean>;
  getBlogLikes(blogId: string): Promise<number>;
  getUserLikedBlogs(userId: string): Promise<string[]>;
  
  // Analytics
  getUserStats(userId: string): Promise<any>;
  getAdminStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db.insert(blogs).values(blog).returning();
    return newBlog;
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog;
  }

  async getBlogWithAuthor(id: string): Promise<any> {
    const [result] = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        category: blogs.category,
        status: blogs.status,
        views: blogs.views,
        likes: blogs.likes,
        aiSentiment: blogs.aiSentiment,
        aiScore: blogs.aiScore,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(blogs)
      .innerJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.id, id));
    return result;
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.authorId, userId))
      .orderBy(desc(blogs.createdAt));
  }

  async getAllBlogs(status?: string): Promise<any[]> {
    const query = db
      .select({
        id: blogs.id,
        title: blogs.title,
        excerpt: blogs.excerpt,
        category: blogs.category,
        status: blogs.status,
        views: blogs.views,
        likes: blogs.likes,
        aiSentiment: blogs.aiSentiment,
        aiScore: blogs.aiScore,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(blogs)
      .innerJoin(users, eq(blogs.authorId, users.id));

    if (status) {
      return await query
        .where(eq(blogs.status, status as "draft" | "pending" | "approved" | "rejected"))
        .orderBy(desc(blogs.createdAt));
    }

    return await query.orderBy(desc(blogs.createdAt));
  }

  async getPendingBlogs(): Promise<any[]> {
    return await db
      .select({
        id: blogs.id,
        title: blogs.title,
        excerpt: blogs.excerpt,
        category: blogs.category,
        aiSentiment: blogs.aiSentiment,
        aiScore: blogs.aiScore,
        createdAt: blogs.createdAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(blogs)
      .innerJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.status, "pending"))
      .orderBy(desc(blogs.createdAt));
  }

  async getTrendingBlogs(limit: number = 6): Promise<any[]> {
    return await db
      .select({
        id: blogs.id,
        title: blogs.title,
        excerpt: blogs.excerpt,
        category: blogs.category,
        views: blogs.views,
        likes: blogs.likes,
        publishedAt: blogs.publishedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(blogs)
      .innerJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.status, "approved"))
      .orderBy(desc(sql`(${blogs.views} * 0.7 + ${blogs.likes} * 1.5)`))
      .limit(limit);
  }

  async updateBlogStatus(id: string, status: string, rejectionReason?: string): Promise<void> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === "approved") {
      updateData.publishedAt = new Date();
    }
    
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    await db.update(blogs).set(updateData).where(eq(blogs.id, id));
  }

  async updateBlogAIAnalysis(id: string, sentiment: string, score: number, analysis: string): Promise<void> {
    await db
      .update(blogs)
      .set({
        aiSentiment: sentiment as "positive" | "neutral" | "negative",
        aiScore: score,
        aiAnalysis: analysis,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id));
  }

  async incrementBlogViews(id: string): Promise<void> {
    await db
      .update(blogs)
      .set({
        views: sql`${blogs.views} + 1`,
      })
      .where(eq(blogs.id, id));
  }

  async searchBlogs(query: string): Promise<any[]> {
    return await db
      .select({
        id: blogs.id,
        title: blogs.title,
        excerpt: blogs.excerpt,
        category: blogs.category,
        views: blogs.views,
        likes: blogs.likes,
        aiSentiment: blogs.aiSentiment,
        publishedAt: blogs.publishedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(blogs)
      .innerJoin(users, eq(blogs.authorId, users.id))
      .where(
        and(
          eq(blogs.status, "approved"),
          or(
            like(blogs.title, `%${query}%`),
            like(blogs.content, `%${query}%`),
            like(blogs.category, `%${query}%`)
          )
        )
      )
      .orderBy(desc(blogs.publishedAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getBlogComments(blogId: string): Promise<any[]> {
    return await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.blogId, blogId))
      .orderBy(desc(comments.createdAt));
  }

  async toggleLike(userId: string, blogId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.blogId, blogId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.blogId, blogId)));
      
      await db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} - 1` })
        .where(eq(blogs.id, blogId));
      
      return false;
    } else {
      // Add like
      await db.insert(likes).values({ userId, blogId });
      
      await db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} + 1` })
        .where(eq(blogs.id, blogId));
      
      return true;
    }
  }

  async getBlogLikes(blogId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.blogId, blogId));
    return result.count;
  }

  async getUserLikedBlogs(userId: string): Promise<string[]> {
    const userLikes = await db
      .select({ blogId: likes.blogId })
      .from(likes)
      .where(eq(likes.userId, userId));
    return userLikes.map(like => like.blogId);
  }

  async getUserStats(userId: string): Promise<any> {
    const [published] = await db
      .select({ count: count() })
      .from(blogs)
      .where(and(eq(blogs.authorId, userId), eq(blogs.status, "approved")));

    const [pending] = await db
      .select({ count: count() })
      .from(blogs)
      .where(and(eq(blogs.authorId, userId), eq(blogs.status, "pending")));

    const [totalViews] = await db
      .select({ sum: sql<number>`coalesce(sum(${blogs.views}), 0)` })
      .from(blogs)
      .where(and(eq(blogs.authorId, userId), eq(blogs.status, "approved")));

    const [totalLikes] = await db
      .select({ sum: sql<number>`coalesce(sum(${blogs.likes}), 0)` })
      .from(blogs)
      .where(and(eq(blogs.authorId, userId), eq(blogs.status, "approved")));

    return {
      published: published.count,
      pending: pending.count,
      totalViews: totalViews.sum,
      totalLikes: totalLikes.sum,
    };
  }

  async getAdminStats(): Promise<any> {
    const [totalBlogs] = await db.select({ count: count() }).from(blogs);
    const [pendingReview] = await db
      .select({ count: count() })
      .from(blogs)
      .where(eq(blogs.status, "pending"));

    const [avgAiScore] = await db
      .select({ avg: sql<number>`coalesce(avg(${blogs.aiScore}), 0)` })
      .from(blogs)
      .where(eq(blogs.status, "approved"));

    return {
      totalBlogs: totalBlogs.count,
      pendingReview: pendingReview.count,
      aiAccuracy: Math.round(avgAiScore.avg * 100) / 100,
    };
  }
}

export const storage = new DatabaseStorage();
