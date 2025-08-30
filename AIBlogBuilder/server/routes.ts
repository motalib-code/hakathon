import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBlogSchema, insertCommentSchema } from "@shared/schema";
import { analyzeContentSentiment, generateExcerpt } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const { status, trending, search } = req.query;
      
      let blogs;
      if (trending === "true") {
        blogs = await storage.getTrendingBlogs(6);
      } else if (search) {
        blogs = await storage.searchBlogs(search as string);
      } else {
        blogs = await storage.getAllBlogs(status as string);
      }
      
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlogWithAuthor(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
      // Increment view count
      await storage.incrementBlogViews(req.params.id);
      
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post("/api/blogs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blogData = insertBlogSchema.parse({
        ...req.body,
        authorId: userId,
      });

      // Generate excerpt if not provided
      if (!blogData.excerpt) {
        blogData.excerpt = await generateExcerpt(blogData.content);
      }

      // Create blog with pending status
      const blog = await storage.createBlog({
        ...blogData,
        status: "pending",
      });

      // Analyze content with AI
      const aiAnalysis = await analyzeContentSentiment(blogData.content);
      await storage.updateBlogAIAnalysis(
        blog.id,
        aiAnalysis.sentiment,
        aiAnalysis.score,
        aiAnalysis.analysis
      );

      // Auto-approve high-quality content
      if (aiAnalysis.score >= 80 && !aiAnalysis.flagged) {
        await storage.updateBlogStatus(blog.id, "approved");
      }

      res.json(blog);
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  app.get("/api/user/blogs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blogs = await storage.getUserBlogs(userId);
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
      res.status(500).json({ message: "Failed to fetch user blogs" });
    }
  });

  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.post("/api/blogs/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const liked = await storage.toggleLike(userId, req.params.id);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/blogs/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getBlogComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/blogs/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        authorId: userId,
        blogId: req.params.id,
      });

      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Admin routes
  app.get("/api/admin/blogs/pending", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingBlogs = await storage.getPendingBlogs();
      res.json(pendingBlogs);
    } catch (error) {
      console.error("Error fetching pending blogs:", error);
      res.status(500).json({ message: "Failed to fetch pending blogs" });
    }
  });

  app.patch("/api/admin/blogs/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, rejectionReason } = req.body;
      await storage.updateBlogStatus(req.params.id, status, rejectionReason);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating blog status:", error);
      res.status(500).json({ message: "Failed to update blog status" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
