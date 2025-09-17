import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export function Header() {
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
          <div className="flex items-center gap-2" data-testid="link-home">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              CV
            </div>
            <span className="font-semibold text-lg">CVBooster</span>
          </div>
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
          <Button variant="ghost" data-testid="button-login">
            Connexion
          </Button>
          <Button data-testid="button-signup">
            Inscription
          </Button>
        </div>
      </div>
    </header>
  );
}