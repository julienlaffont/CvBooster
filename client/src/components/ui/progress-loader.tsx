import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProgressLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "overlay" | "inline";
  className?: string;
}

export function ProgressLoader({ 
  text = "L'IA traite votre demande...", 
  size = "md",
  variant = "default",
  className 
}: ProgressLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (variant === "overlay") {
    return (
      <div className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}>
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <Loader2 className={cn(
                "animate-spin text-primary relative z-10",
                sizeClasses[size]
              )} />
            </div>
            <p className={cn(
              "font-medium text-foreground",
              textSizeClasses[size]
            )}>
              {text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )} />
        <span className={cn(
          "text-muted-foreground",
          textSizeClasses[size]
        )}>
          {text}
        </span>
      </div>
    );
  }

  // Default variant - card with subtle background
  return (
    <div className={cn(
      "flex items-center justify-center p-6 bg-muted/30 rounded-lg border border-muted",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-110" />
          {/* Inner spinning loader */}
          <Loader2 className={cn(
            "animate-spin text-primary relative z-10",
            sizeClasses[size]
          )} />
        </div>
        <div className="flex flex-col">
          <p className={cn(
            "font-medium text-foreground",
            textSizeClasses[size]
          )}>
            {text}
          </p>
          <div className="mt-2 w-32 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" 
                 style={{
                   animation: "loading-bar 2s ease-in-out infinite"
                 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add custom animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes loading-bar {
    0% { width: 0%; opacity: 1; }
    50% { width: 60%; opacity: 0.8; }
    100% { width: 100%; opacity: 0.6; }
  }
`;
document.head.appendChild(style);