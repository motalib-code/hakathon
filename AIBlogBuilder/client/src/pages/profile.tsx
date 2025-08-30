import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User,
  PenTool, 
  Clock, 
  Heart, 
  Eye,
  BarChart3,
  TrendingUp,
  Calendar,
  Settings,
  Award,
  Lightbulb,
  FileText,
  Edit3,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [isAuthenticated, toast]);

  // Fetch user blogs
  const { data: userBlogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["/api/user/blogs"],
    enabled: isAuthenticated,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getFullName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return "Anonymous User";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent text-accent-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <ExternalLink className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "rejected":
        return <FileText className="w-3 h-3" />;
      case "draft":
        return <Edit3 className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Writing Journey</h1>
            <p className="text-lg text-muted-foreground">
              Track your articles, engagement, and growth with personalized insights
            </p>
          </motion.div>

          {/* Profile Info */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="text-lg">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold" data-testid="text-user-name">
                      {getFullName(user)}
                    </h2>
                    <p className="text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(user?.createdAt || new Date().toISOString())}</span>
                      </div>
                      {user?.isAdmin && (
                        <Badge className="bg-chart-4 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" data-testid="button-edit-profile">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Link href="/write">
                      <Button data-testid="button-new-article">
                        <PenTool className="w-4 h-4 mr-2" />
                        New Article
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-2 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <PenTool className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl" data-testid="stat-published">
                  {statsLoading ? "..." : userStats?.published || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Published</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-2 to-chart-3 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl" data-testid="stat-pending">
                  {statsLoading ? "..." : userStats?.pending || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-3 to-chart-4 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Heart className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl" data-testid="stat-total-likes">
                  {statsLoading ? "..." : (userStats?.totalLikes || 0).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-4 to-chart-5 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Eye className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl" data-testid="stat-total-views">
                  {statsLoading ? "..." : (userStats?.totalViews || 0).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles List */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                      <TabsTrigger value="published" data-testid="tab-published">Published</TabsTrigger>
                      <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
                      <TabsTrigger value="drafts" data-testid="tab-drafts">Drafts</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="mt-6">
                      {blogsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 border border-border rounded-lg animate-pulse" data-testid={`skeleton-blog-${i}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-muted rounded w-3/4"></div>
                                  <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                                <div className="h-6 w-16 bg-muted rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userBlogs?.length === 0 ? (
                        <div className="text-center py-12">
                          <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Start your writing journey by creating your first article
                          </p>
                          <Link href="/write">
                            <Button data-testid="button-write-first-article">
                              <PenTool className="w-4 h-4 mr-2" />
                              Write Your First Article
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userBlogs?.map((blog: any) => (
                            <motion.div
                              key={blog.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                              data-testid={`blog-item-${blog.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1" data-testid={`blog-title-${blog.id}`}>
                                    {blog.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-2" data-testid={`blog-date-${blog.id}`}>
                                    {blog.status === "approved" && blog.publishedAt
                                      ? `Published ${formatDate(blog.publishedAt)}`
                                      : `Created ${formatDate(blog.createdAt)}`
                                    }
                                  </p>
                                  {blog.status === "approved" && (
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Eye className="w-3 h-3" />
                                        <span data-testid={`blog-views-${blog.id}`}>{blog.views || 0}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Heart className="w-3 h-3" />
                                        <span data-testid={`blog-likes-${blog.id}`}>{blog.likes || 0}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge className={getStatusColor(blog.status)} data-testid={`blog-status-${blog.id}`}>
                                    {getStatusIcon(blog.status)}
                                    <span className="ml-1 capitalize">{blog.status}</span>
                                  </Badge>
                                  {blog.status === "draft" && (
                                    <Button variant="ghost" size="sm" data-testid={`button-edit-${blog.id}`}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {blog.rejectionReason && (
                                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                  <p className="text-xs text-destructive font-medium">Rejection Reason:</p>
                                  <p className="text-xs text-muted-foreground mt-1">{blog.rejectionReason}</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Other tab contents would filter the blogs array */}
                    <TabsContent value="published">
                      <div className="space-y-4">
                        {userBlogs?.filter((blog: any) => blog.status === "approved").map((blog: any) => (
                          <div key={blog.id} className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-sm">{blog.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Published {formatDate(blog.publishedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="pending">
                      <div className="space-y-4">
                        {userBlogs?.filter((blog: any) => blog.status === "pending").map((blog: any) => (
                          <div key={blog.id} className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-sm">{blog.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Submitted {formatDate(blog.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="drafts">
                      <div className="space-y-4">
                        {userBlogs?.filter((blog: any) => blog.status === "draft").map((blog: any) => (
                          <div key={blog.id} className="p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-sm">{blog.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Last edited {formatDate(blog.updatedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="mr-2 text-chart-1 w-5 h-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <span className="text-sm font-semibold text-accent">+24%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Read Time</span>
                      <span className="text-sm font-semibold">4.2 min</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-chart-3 to-chart-4 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Engagement Rate</span>
                      <span className="text-sm font-semibold">8.7%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-gradient-to-r from-chart-5 to-destructive rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="mr-2 text-secondary w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm font-medium">Trending Topic Alert</p>
                    <p className="text-xs text-muted-foreground">
                      "Web3 Development" is trending. Consider writing about it!
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium">Engagement Boost</p>
                    <p className="text-xs text-muted-foreground">
                      Adding code examples increases engagement by 67%
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <p className="text-sm font-medium">Optimal Posting Time</p>
                    <p className="text-xs text-muted-foreground">
                      Tuesday 2-4 PM shows highest engagement for your audience
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="mr-2 text-chart-5 w-5 h-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-chart-1 to-chart-2 rounded-full flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First Article</p>
                      <p className="text-xs text-muted-foreground">Published your first blog post</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-chart-3 to-chart-4 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Popular Post</p>
                      <p className="text-xs text-muted-foreground">Received 100+ likes on an article</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 opacity-50">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trending Author</p>
                      <p className="text-xs text-muted-foreground">Get featured in trending (5/10 articles)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
