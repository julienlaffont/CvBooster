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
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Logo data-testid="link-home" className="hover:opacity-80 transition-opacity" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer" data-testid="link-home-nav">
            Host
          </Link>
          <Link href="/features" className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer" data-testid="link-features">
            Carriers
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer" data-testid="link-pricing">
            Professional CV
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
          <span className="text-sm text-blue-600 font-medium">#0A74DA</span>
        </div>
      </div>
    </header>
  );
}