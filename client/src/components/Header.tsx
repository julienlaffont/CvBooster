import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/">
          <Logo data-testid="link-home" className="hover:opacity-80 transition-opacity" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="link-features">
              Fonctionnalités
            </span>
          </Link>
          <Link href="#pricing">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="link-pricing">
              Tarifs
            </span>
          </Link>
          <Link href="#testimonials">
            <span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="link-testimonials">
              Témoignages
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="button-dashboard">
                  Dashboard
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" data-testid="button-chat">
                  IA Coach
                </Button>
              </Link>
              <Link href="/photo">
                <Button variant="ghost" data-testid="button-photo">
                  Photo Pro
                </Button>
              </Link>
              <Link href="/wizard">
                <Button variant="ghost" data-testid="button-wizard">
                  Assistant CV
                </Button>
              </Link>
              <Link href="/cover-letter">
                <Button variant="ghost" data-testid="button-cover-letter">
                  Lettre IA
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback data-testid="avatar-fallback">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  Déconnexion
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                Connexion
              </Button>
              <Button
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signup"
              >
                Inscription
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}