import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import ReactMarkdown from "react-markdown";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Bookmark,
  Brain,
  Send
} from "lucide-react";

export default function BlogDetail() {
  const [match, params] = useRoute("/blog/:id");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  if (!match || !params?.id) {
    return <div>Blog not found</div>;
  }

  const blogId = params.id;

  // Fetch blog details
  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ["/api/blogs", blogId],
  });

  // Fetch blog comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/blogs", blogId, "comments"],
  });

  // Fetch user liked blogs
  const { data: userLikes } = useQuery({
    queryKey: ["/api/user", "liked"],
    enabled: isAuthenticated,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/blogs/${blogId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", blogId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", "liked"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/blogs/${blogId}/comments`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", blogId, "comments"] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (!comment.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(comment);
  };

  const getInitials = (author: any) => {
    if (author?.firstName && author?.lastName) {
      return `${author.firstName[0]}${author.lastName[0]}`;
    }
    return "A";
  };

  const getAuthorName = (author: any) => {
    if (author?.firstName && author?.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return "Anonymous";
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-accent text-accent-foreground";
      case "negative":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isLiked = userLikes?.includes(blogId);

  if (blogLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Blog Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/">Back to Home</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 hover:bg-muted"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          {/* Article Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge className="bg-chart-1 text-white">{blog.category}</Badge>
                  {blog.aiSentiment && (
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-chart-4" />
                      <Badge className={getSentimentColor(blog.aiSentiment)}>
                        {blog.aiSentiment}
                      </Badge>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold leading-tight" data-testid="text-blog-title">
                  {blog.title}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={blog.author?.profileImageUrl || ""} />
                      <AvatarFallback>{getInitials(blog.author)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" data-testid="text-blog-author">
                        {getAuthorName(blog.author)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span data-testid="text-blog-date">{formatDate(blog.publishedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span data-testid="text-blog-views">{blog.views?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-share"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-bookmark"
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert" data-testid="div-blog-content">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Actions */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 hover:text-destructive transition-colors ${
                      isLiked ? "text-destructive" : ""
                    }`}
                    onClick={handleLike}
                    disabled={likeMutation.isPending}
                    data-testid="button-like-blog"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{blog.likes} likes</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MessageCircle className="w-5 h-5" />
                    <span data-testid="text-comment-count">{comments?.length || 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.share?.({
                        title: blog.title,
                        text: blog.excerpt,
                        url: window.location.href,
                      }) || navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Shared!",
                        description: "Link copied to clipboard",
                      });
                    }}
                    data-testid="button-share-blog"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h3 className="text-2xl font-bold">Comments</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment */}
              {isAuthenticated && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts on this article..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleComment}
                      disabled={commentMutation.isPending || !comment.trim()}
                      data-testid="button-post-comment"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse" data-testid={`skeleton-comment-${i}`}>
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-12 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No comments yet</h4>
                  <p className="text-muted-foreground">
                    {isAuthenticated 
                      ? "Be the first to share your thoughts!" 
                      : "Log in to join the conversation"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments?.map((comment: any) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-3"
                      data-testid={`comment-${comment.id}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author?.profileImageUrl || ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm" data-testid={`comment-author-${comment.id}`}>
                            {getAuthorName(comment.author)}
                          </span>
                          <span className="text-xs text-muted-foreground" data-testid={`comment-date-${comment.id}`}>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm" data-testid={`comment-content-${comment.id}`}>
                          {comment.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}