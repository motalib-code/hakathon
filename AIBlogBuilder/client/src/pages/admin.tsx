import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ClipboardList, 
  Check, 
  X, 
  Brain, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  BarChart3,
  Activity,
  Eye,
  Heart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin access
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

    if (isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, user, toast]);

  // Fetch pending blogs
  const { data: pendingBlogs, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/admin/blogs/pending"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Update blog status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/blogs/${id}/status`, {
        status,
        rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: "Success",
        description: "Blog status updated successfully",
      });
      setRejectionReason("");
      setSelectedBlog(null);
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
        description: "Failed to update blog status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (blogId: string) => {
    updateStatusMutation.mutate({ id: blogId, status: "approved" });
  };

  const handleReject = (blog: any) => {
    setSelectedBlog(blog);
  };

  const confirmReject = () => {
    if (!selectedBlog || !rejectionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    updateStatusMutation.mutate({
      id: selectedBlog.id,
      status: "rejected",
      rejectionReason,
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-accent text-accent-foreground";
      case "negative":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-secondary";
    return "text-destructive";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
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

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">
                This page requires admin privileges
              </p>
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              AI-powered content moderation and analytics
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-2 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl" data-testid="stat-total-blogs">
                  {statsLoading ? "..." : adminStats?.totalBlogs || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Total Blogs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-chart-3 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Clock className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl text-secondary" data-testid="stat-pending-review">
                  {statsLoading ? "..." : adminStats?.pendingReview || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-chart-4 to-chart-5 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Brain className="text-white w-6 h-6" />
                </div>
                <h3 className="font-semibold text-2xl text-accent" data-testid="stat-ai-accuracy">
                  {statsLoading ? "..." : `${adminStats?.aiAccuracy || 0}%`}
                </h3>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Dashboard */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Engagement Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 text-chart-1 w-5 h-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Mon", views: 240, likes: 45 },
                        { name: "Tue", views: 380, likes: 67 },
                        { name: "Wed", views: 520, likes: 89 },
                        { name: "Thu", views: 420, likes: 78 },
                        { name: "Fri", views: 680, likes: 112 },
                        { name: "Sat", views: 590, likes: 98 },
                        { name: "Sun", views: 450, likes: 72 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Bar dataKey="views" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="likes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Quality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 text-chart-4 w-5 h-5" />
                  AI Quality Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Excellent (80-100)", value: 35, fill: "hsl(var(--chart-1))" },
                          { name: "Good (60-79)", value: 45, fill: "hsl(var(--chart-2))" },
                          { name: "Average (40-59)", value: 15, fill: "hsl(var(--chart-3))" },
                          { name: "Needs Work (<40)", value: 5, fill: "hsl(var(--chart-5))" },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        className="text-xs"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog Activity Trends */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 text-chart-2 w-5 h-5" />
                  Publishing Activity & Sentiment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", published: 12, positive: 8, neutral: 3, negative: 1 },
                        { month: "Feb", published: 18, positive: 14, neutral: 3, negative: 1 },
                        { month: "Mar", published: 25, positive: 19, neutral: 4, negative: 2 },
                        { month: "Apr", published: 22, positive: 17, neutral: 4, negative: 1 },
                        { month: "May", published: 28, positive: 21, neutral: 5, negative: 2 },
                        { month: "Jun", published: 35, positive: 28, neutral: 5, negative: 2 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="published" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="positive" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="neutral" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="negative" 
                        stroke="hsl(var(--chart-5))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pending Reviews */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <ClipboardList className="mr-2 text-primary w-5 h-5" />
                      Pending Reviews
                      <Badge className="ml-2 bg-secondary text-secondary-foreground" data-testid="badge-pending-count">
                        {pendingBlogs?.length || 0}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search blogs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                          data-testid="input-search-blogs"
                        />
                      </div>
                      <Button variant="outline" size="icon" data-testid="button-filter">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg animate-pulse" data-testid={`skeleton-pending-${i}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                              <div className="h-3 bg-muted rounded w-1/4"></div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="h-8 w-16 bg-muted rounded"></div>
                              <div className="h-8 w-16 bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pendingBlogs?.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending reviews</h3>
                      <p className="text-muted-foreground">All articles have been reviewed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBlogs
                        ?.filter((blog: any) => 
                          !searchQuery || 
                          blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.author.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.author.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((blog: any) => (
                        <motion.div
                          key={blog.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          data-testid={`pending-blog-${blog.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1" data-testid={`title-${blog.id}`}>
                                {blog.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2" data-testid={`author-${blog.id}`}>
                                by {blog.author.firstName} {blog.author.lastName}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span data-testid={`date-${blog.id}`}>{formatDate(blog.createdAt)}</span>
                                </span>
                                {blog.aiScore && (
                                  <span className="flex items-center space-x-1">
                                    <Brain className="w-3 h-3 text-chart-4" />
                                    <span className={getScoreColor(blog.aiScore)} data-testid={`ai-score-${blog.id}`}>
                                      AI Score: {blog.aiScore}%
                                    </span>
                                  </span>
                                )}
                                <Badge className={getSentimentColor(blog.aiSentiment || "neutral")} data-testid={`sentiment-${blog.id}`}>
                                  {blog.aiSentiment || "neutral"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-accent text-accent-foreground hover:bg-accent/80"
                                onClick={() => handleApprove(blog.id)}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-approve-${blog.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(blog)}
                                    disabled={updateStatusMutation.isPending}
                                    data-testid={`button-reject-${blog.id}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Article</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                      Please provide a reason for rejecting "{blog.title}"
                                    </p>
                                    <Textarea
                                      placeholder="Enter rejection reason..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      className="min-h-[100px]"
                                      data-testid="textarea-rejection-reason"
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setSelectedBlog(null)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={confirmReject}
                                        disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
                                        data-testid="button-confirm-reject"
                                      >
                                        Reject Article
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-${blog.id}`}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Brain className="mr-2 text-chart-4 w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm font-medium text-accent">High Quality Content</p>
                    <p className="text-xs text-muted-foreground">
                      3 articles show exceptional engagement potential
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <p className="text-sm font-medium text-secondary">Trending Topics</p>
                    <p className="text-xs text-muted-foreground">
                      AI, React, and Design trending 45% above average
                    </p>
                  </div>
                  <div className="p-3 bg-chart-4/10 border border-chart-4/20 rounded-lg">
                    <p className="text-sm font-medium">Content Quality Improving</p>
                    <p className="text-xs text-muted-foreground">
                      Average AI score increased by 12% this week
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-bulk-approve">
                    <Check className="w-4 h-4 mr-2" />
                    Bulk Approve High Scores
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-users">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-muted-foreground">Blog approved: "React Hooks Guide"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-muted-foreground">New submission: "TypeScript Tips"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <span className="text-muted-foreground">Blog flagged by AI</span>
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
