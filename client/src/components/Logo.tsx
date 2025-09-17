import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background with subtle gradient effect */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-slate-800 dark:stop-color-slate-200" />
              <stop offset="100%" className="stop-color-slate-900 dark:stop-color-slate-100" />
            </linearGradient>
          </defs>
          
          {/* Main container - rounded square */}
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="6"
            fill="url(#logoGradient)"
            className="drop-shadow-sm"
          />
          
          {/* Document pages effect */}
          <rect
            x="7"
            y="6"
            width="14"
            height="18"
            rx="2"
            fill="currentColor"
            className="text-white dark:text-slate-900"
          />
          
          {/* Second page behind for depth */}
          <rect
            x="8"
            y="7"
            width="14"
            height="18"
            rx="2"
            fill="currentColor"
            className="text-white/90 dark:text-slate-900/90"
          />
          
          {/* CV text lines */}
          <rect x="10" y="10" width="8" height="1.5" rx="0.5" className="fill-slate-600 dark:fill-slate-400" />
          <rect x="10" y="13" width="10" height="1" rx="0.5" className="fill-slate-500 dark:fill-slate-500" />
          <rect x="10" y="15.5" width="6" height="1" rx="0.5" className="fill-slate-500 dark:fill-slate-500" />
          <rect x="10" y="18" width="9" height="1" rx="0.5" className="fill-slate-500 dark:fill-slate-500" />
          <rect x="10" y="20.5" width="7" height="1" rx="0.5" className="fill-slate-500 dark:fill-slate-500" />
          
          {/* Modern accent line */}
          <rect x="6" y="26" width="20" height="2" rx="1" className="fill-primary" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn("font-semibold", textSizeClasses[size])}>
          CVBooster
        </span>
      )}
    </div>
  );
}