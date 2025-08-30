import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Feather, 
  Sparkles, 
  PuzzleIcon, 
  Rocket, 
  Heart, 
  MessageCircle, 
  Eye,
  Search,
  Brain,
  BarChart3,
  Lightbulb,
  Github,
  Twitter,
  MessageSquare
} from "lucide-react";

export default function Landing() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Feather className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold gradient-text">BlogCraft</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#builder" className="text-muted-foreground hover:text-foreground transition-colors">AI Builder</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>

          <Button asChild data-testid="button-get-started">
            <a href="/api/login">Get Started</a>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Create. Share. Inspire.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The AI-powered blogging platform where creativity meets intelligence. Write amazing content, 
              build stunning websites, and reach your audience like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-105 animated-border"
                data-testid="button-start-writing"
              >
                <a href="/api/login">Start Writing</a>
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="transition-all"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16" id="features">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
                Featured Content
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
                Discover trending articles powered by AI insights
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample featured blogs */}
              <motion.div variants={itemVariants}>
                <Card className="blog-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300" data-testid="card-sample-blog-1">
                  <div className="h-48 bg-gradient-to-br from-chart-1/20 to-chart-2/20 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-primary" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-chart-1 text-white">Technology</Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>2.4k</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">The Future of AI in Web Development</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Exploring how artificial intelligence is revolutionizing the way we build and design websites...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
                        <span className="text-sm font-medium">Alex Chen</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>24</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="blog-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300" data-testid="card-sample-blog-2">
                  <div className="h-48 bg-gradient-to-br from-secondary/20 to-chart-3/20 flex items-center justify-center">
                    <PuzzleIcon className="w-16 h-16 text-secondary" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-secondary text-secondary-foreground">Design</Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>1.8k</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Design Systems That Scale</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Building consistent, maintainable design languages for growing product teams...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full"></div>
                        <span className="text-sm font-medium">Sarah Johnson</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 fill-current text-destructive" />
                          <span>43</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>15</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="blog-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300" data-testid="card-sample-blog-3">
                  <div className="h-48 bg-gradient-to-br from-chart-4/20 to-chart-5/20 flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-chart-4" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-chart-4 text-white">Analytics</Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>3.2k</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Data-Driven Content Strategy</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      How to use analytics to create content that resonates with your audience...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-chart-4 to-chart-5 rounded-full"></div>
                        <span className="text-sm font-medium">Mike Rodriguez</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>67</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>23</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Builder Showcase */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10" id="builder">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI Website Builder</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create professional websites with our revolutionary drag-and-drop builder powered by AI
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered Generation</h3>
                    <p className="text-muted-foreground text-sm">
                      Describe your vision and watch AI generate complete React components with backend logic
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                    <PuzzleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Visual Development</h3>
                    <p className="text-muted-foreground text-sm">
                      Drag, drop, and customize components while AI handles the complex coding underneath
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent text-accent-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">One-Click Deploy</h3>
                    <p className="text-muted-foreground text-sm">
                      Deploy your creation instantly to the cloud with automated CI/CD pipeline
                    </p>
                  </div>
                </div>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">AI Builder Canvas</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Desktop</Button>
                      <Button variant="outline" size="sm">Mobile</Button>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
                    <div className="space-y-4">
                      <div className="w-full h-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded animate-pulse"></div>
                      <div className="flex space-x-2">
                        <div className="flex-1 h-20 bg-card border border-border rounded"></div>
                        <div className="flex-1 h-20 bg-card border border-border rounded"></div>
                      </div>
                      <div className="w-full h-8 bg-accent/30 rounded animate-pulse"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Drag components here or describe what you want to build
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Components: 12</span>
                    <span>AI Confidence: 94%</span>
                    <span><i className="fas fa-save"></i> Auto-saved</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
                Powerful Features
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
                Everything you need to create and manage amazing content
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-2 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Content Analysis</h3>
                    <p className="text-muted-foreground text-sm">
                      Advanced sentiment analysis and quality scoring to optimize your content
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-chart-2 to-chart-3 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Search</h3>
                    <p className="text-muted-foreground text-sm">
                      NLP-powered search that understands context and intent
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-chart-3 to-chart-4 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                    <p className="text-muted-foreground text-sm">
                      Track engagement, views, and performance with detailed insights
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of writers and creators who are already using BlogCraft to share their stories
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-105"
              data-testid="button-join-now"
            >
              <a href="/api/login">Join BlogCraft Today</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Feather className="text-white w-3 h-3" />
                </div>
                <span className="font-bold gradient-text">BlogCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The AI-powered platform for creators, writers, and builders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Write</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discover</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AI Builder</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" data-testid="link-twitter">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="link-github">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="link-discord">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BlogCraft. Powered by AI, built for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
