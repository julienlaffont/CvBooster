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
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* CV Symbol with C and V (arrow) */}
          <g transform="translate(16, 8)">
            {/* Letter C */}
            <path
              d="M8 4C8 1.79086 9.79086 0 12 0C14.2091 0 16 1.79086 16 4V8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8V4Z"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 4C8 1.79086 9.79086 0 12 0"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M8 8C8 10.2091 9.79086 12 12 12"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Letter V (arrow pointing up and right) */}
            <g transform="translate(18, 0)">
              {/* Arrow body */}
              <path
                d="M0 8L8 0L12 4L8 8L0 8Z"
                fill="white"
                fillOpacity="0.9"
              />
              {/* Arrow head with gradient effect */}
              <path
                d="M8 0L16 8L12 8L8 4L8 0Z"
                fill="url(#arrowGradient)"
              />
              {/* Arrow tip */}
              <path
                d="M12 8L16 8L14 10L12 8Z"
                fill="white"
                fillOpacity="0.7"
              />
            </g>
          </g>
          
          {/* Gradient definition for arrow */}
          <defs>
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={cn("font-semibold text-blue-600", textSizeClasses[size])}>
          cvbooster
        </span>
      )}
    </div>
  );
}