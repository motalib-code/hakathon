import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { BlogCard } from "@/components/blog-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, TrendingUp, Flame, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Trending blogs query
  const { data: trendingBlogs, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/blogs", { trending: true }],
    enabled: isAuthenticated,
  });

  // All blogs query
  const { data: allBlogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["/api/blogs", activeFilter === "all" ? {} : { status: activeFilter }],
    enabled: isAuthenticated,
  });

  // User liked blogs
  const { data: userLikes } = useQuery({
    queryKey: ["/api/user", "liked"],
    enabled: isAuthenticated,
  });

  // Search functionality with debounced search
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch(`/api/blogs?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: (results) => {
      setSearchResults(results);
      setIsSearching(false);
    },
    onError: () => {
      toast({
        title: "Search Error",
        description: "Failed to search articles",
        variant: "destructive",
      });
      setIsSearching(false);
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchMutation.mutate(searchQuery);
  };

  // Auto-search on input change with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12 mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Welcome back to BlogCraft
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover trending content, share your thoughts, and connect with fellow creators
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by content, sentiment, or ask a question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-16 py-3 text-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Trending Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold flex items-center">
              <Flame className="w-8 h-8 text-destructive mr-3" />
              Trending Now
            </motion.h2>
            <motion.div variants={itemVariants} className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Updated hourly by AI</span>
            </motion.div>
          </div>
          
          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-trending-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingBlogs?.map((blog: any) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  userLikes={userLikes}
                  onBlogClick={(id) => {
                    // Navigate to blog detail page
                    toast({
                      title: "Opening blog...",
                      description: blog.title,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Latest Blogs Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold">
              Latest Articles
            </motion.h2>
            <motion.div variants={itemVariants} className="flex items-center space-x-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={activeFilter === "Technology" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("Technology")}
                data-testid="filter-technology"
              >
                Technology
              </Button>
              <Button
                variant={activeFilter === "Design" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("Design")}
                data-testid="filter-design"
              >
                Design
              </Button>
            </motion.div>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Search Results for "{searchQuery}"
                </h3>
                <Badge variant="outline" data-testid="badge-search-count">
                  {isSearching ? "Searching..." : `${searchResults.length} results`}
                </Badge>
              </div>
              {isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse" data-testid={`skeleton-search-${i}`}>
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-4"></div>
                        <div className="h-6 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded mb-4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No articles found matching your search</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((blog: any) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      userLikes={userLikes}
                      onBlogClick={(id) => {
                        setLocation(`/blog/${id}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`skeleton-blog-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allBlogs?.length === 0 ? (
            <Card className="p-12 text-center">
              <CardContent>
                <p className="text-muted-foreground text-lg mb-4">No articles found</p>
                <Link href="/write">
                  <Button data-testid="button-write-first">
                    <Plus className="w-4 h-4 mr-2" />
                    Write your first article
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : !searchQuery.trim() ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBlogs?.map((blog: any) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  userLikes={userLikes}
                  onBlogClick={(id) => {
                    setLocation(`/blog/${id}`);
                  }}
                />
              ))}
            </div>
          ) : null}
        </motion.section>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link href="/write">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-bounce-soft"
            data-testid="button-fab-write"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
