import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { motion } from "framer-motion";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    views: number;
    likes: number;
    publishedAt: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
  userLikes?: string[];
  onBlogClick?: (id: string) => void;
}

export function BlogCard({ blog, userLikes = [], onBlogClick }: BlogCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isLiked = userLikes.includes(blog.id);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/blogs/${blog.id}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    likeMutation.mutate();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-chart-1 text-white",
      Design: "bg-secondary text-secondary-foreground",
      Analytics: "bg-chart-4 text-white",
      Business: "bg-chart-5 text-white",
      Lifestyle: "bg-accent text-accent-foreground",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getAuthorName = () => {
    if (blog.author.firstName && blog.author.lastName) {
      return `${blog.author.firstName} ${blog.author.lastName}`;
    }
    return "Anonymous";
  };

  const getInitials = () => {
    if (blog.author.firstName && blog.author.lastName) {
      return `${blog.author.firstName[0]}${blog.author.lastName[0]}`;
    }
    return "A";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="blog-card cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] md:hover:scale-[1.02]"
        onClick={() => onBlogClick?.(blog.id)}
        data-testid={`card-blog-${blog.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge className={getCategoryColor(blog.category)} data-testid={`badge-category-${blog.id}`}>
              {blog.category}
            </Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span data-testid={`text-views-${blog.id}`}>{blog.views.toLocaleString()}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 line-clamp-2" data-testid={`text-title-${blog.id}`}>
            {blog.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-excerpt-${blog.id}`}>
            {blog.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={blog.author.profileImageUrl || ""} />
                <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium" data-testid={`text-author-${blog.id}`}>
                {getAuthorName()}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 text-xs">
                <Clock className="w-3 h-3" />
                <span data-testid={`text-date-${blog.id}`}>{formatDate(blog.publishedAt)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-auto hover:text-destructive transition-colors ${
                  isLiked ? "text-destructive" : ""
                }`}
                onClick={handleLike}
                disabled={likeMutation.isPending}
                data-testid={`button-like-${blog.id}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="ml-1">{blog.likes}</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span data-testid={`text-comments-${blog.id}`}>0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
