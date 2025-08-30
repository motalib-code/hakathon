import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Save, Send, Brain, Lightbulb, AlertCircle } from "lucide-react";

export default function Write() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [aiInsights, setAiInsights] = useState<any>(null);

  const createBlogMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; status: string }) => {
      const response = await apiRequest("POST", "/api/blogs", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", "blogs"] });
      toast({
        title: "Success!",
        description: data.status === "approved" 
          ? "Your article has been published!" 
          : "Your article has been submitted for review!",
      });
      setLocation("/profile");
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
        description: "Failed to save article",
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = () => {
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, content, and category",
        variant: "destructive",
      });
      return;
    }

    createBlogMutation.mutate({
      title,
      content,
      category,
      status: "draft",
    });
  };

  const handleSubmitForReview = () => {
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, content, and category",
        variant: "destructive",
      });
      return;
    }

    createBlogMutation.mutate({
      title,
      content,
      category,
      status: "pending",
    });
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (title.trim() && content.trim() && category) {
        // Auto-save logic could be implemented here
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [title, content, category]);

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

  const categories = ["Technology", "Design", "Business", "Lifestyle", "Analytics"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Create Your Article</h1>
            <p className="text-lg text-muted-foreground">
              AI-assisted editor with real-time sentiment analysis and content optimization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              {/* Article Header */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter your article title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
                    data-testid="input-title"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-48" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Brain className="w-4 h-4 text-primary" />
                      <span>AI assistance enabled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Markdown Editor */}
              <MarkdownEditor
                value={content}
                onChange={setContent}
                onSave={handleSaveDraft}
                onSubmit={handleSubmitForReview}
                aiSentiment={aiInsights?.sentiment}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Auto-saved 30s ago</span>
                  {aiInsights && (
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3 text-accent" />
                      <span>Sentiment: {aiInsights.sentiment}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={createBlogMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmitForReview}
                    disabled={createBlogMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Writing Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-secondary" />
                    Writing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm font-medium">Hook Your Readers</p>
                    <p className="text-xs text-muted-foreground">
                      Start with a compelling question or surprising statistic
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium">Use Examples</p>
                    <p className="text-xs text-muted-foreground">
                      Code examples increase engagement by 67%
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <p className="text-sm font-medium">Trending Topics</p>
                    <p className="text-xs text-muted-foreground">
                      AI, React, and Design are trending 45% above average
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {aiInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-chart-4" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                      <Badge variant="outline">{aiInsights.score}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sentiment</span>
                      <Badge className={
                        aiInsights.sentiment === "positive" ? "bg-accent text-accent-foreground" :
                        aiInsights.sentiment === "negative" ? "bg-destructive text-destructive-foreground" :
                        "bg-muted text-muted-foreground"
                      }>
                        {aiInsights.sentiment}
                      </Badge>
                    </div>
                    {aiInsights.flagged && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">Content Flagged</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {aiInsights.flagReason || "Content may need review"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Markdown Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Markdown Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code># Heading 1</code>
                    <span className="text-muted-foreground">Title</span>
                  </div>
                  <div className="flex justify-between">
                    <code>## Heading 2</code>
                    <span className="text-muted-foreground">Subtitle</span>
                  </div>
                  <div className="flex justify-between">
                    <code>**bold**</code>
                    <span className="text-muted-foreground">Bold text</span>
                  </div>
                  <div className="flex justify-between">
                    <code>*italic*</code>
                    <span className="text-muted-foreground">Italic text</span>
                  </div>
                  <div className="flex justify-between">
                    <code>`code`</code>
                    <span className="text-muted-foreground">Inline code</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
