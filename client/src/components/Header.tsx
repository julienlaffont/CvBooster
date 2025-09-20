import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, ChevronDown, Brain, FileText, Camera, MessageSquare, Download, Users } from "lucide-react";
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="dropdown-features">
              Fonctionnalités
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuItem asChild>
                <Link href="/features/analyse-ia" className="flex items-center gap-2 w-full">
                  <Brain className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Analyse IA</div>
                    <div className="text-xs text-muted-foreground">Optimise ton CV avec l'IA</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/lettre-personnalisee" className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Lettres Personnalisées</div>
                    <div className="text-xs text-muted-foreground">Génère des lettres uniques</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/photo-ia" className="flex items-center gap-2 w-full">
                  <Camera className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Photo Pro IA</div>
                    <div className="text-xs text-muted-foreground">Améliore ta photo de profil</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/contexting-ia" className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Coaching IA 24/7</div>
                    <div className="text-xs text-muted-foreground">Assistant virtuel disponible</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/export-professionnel" className="flex items-center gap-2 w-full">
                  <Download className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Export Professionnel</div>
                    <div className="text-xs text-muted-foreground">PDF haute qualité</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/features/multisecteur" className="flex items-center gap-2 w-full">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Multi-secteurs</div>
                    <div className="text-xs text-muted-foreground">Conseils pour tous les métiers</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="link-pricing">
            Tarifs
          </Link>
          <Link href="/testimonials" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" data-testid="link-testimonials">
            Témoignages
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
                  <AvatarImage src={(user as any)?.profileImageUrl || ""} />
                  <AvatarFallback data-testid="avatar-fallback">
                    {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
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
                Essai gratuit
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}