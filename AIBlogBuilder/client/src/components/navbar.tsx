import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Moon, Sun, Feather, PlusCircle } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Feather className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold gradient-text">BlogCraft</span>
        </Link>
        
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="link-discover"
            >
              Discover
            </Link>
            <Link 
              href="/write" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/write" ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="link-write"
            >
              Write
            </Link>
            <Link 
              href="/profile" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/profile" ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid="link-profile"
            >
              Dashboard
            </Link>
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/admin" ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="link-admin"
              >
                Admin
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              <Link href="/write">
                <Button variant="ghost" size="icon" data-testid="button-write">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </Link>

              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger data-testid="dropdown-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="menu-profile">Profile</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="menu-admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="menu-logout">Logout</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Login</a>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
