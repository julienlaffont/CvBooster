import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Rocket, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionBannerProps {
  feature?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

const planIcons = {
  debutant: Zap,
  pro: Crown,
  expert: Rocket,
};

const planColors = {
  debutant: "bg-muted text-muted-foreground",
  pro: "bg-blue-500 text-white",
  expert: "bg-purple-500 text-white",
};

export function SubscriptionBanner({ feature, showUpgradeButton = true, compact = false }: SubscriptionBannerProps) {
  const {
    currentPlan,
    isActive,
    remainingCVGenerations,
    remainingCoverLetterGenerations,
    canGenerateCV,
    canGenerateCoverLetter,
    isPremiumUser,
    isLoading
  } = useSubscription();

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const PlanIcon = planIcons[currentPlan];
  const planDisplayName = {
    debutant: "Débutant",
    pro: "Pro", 
    expert: "Expert"
  }[currentPlan];

  // For premium users with active subscriptions
  if (isPremiumUser) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 mb-4">
          <Badge className={planColors[currentPlan]}>
            <PlanIcon className="h-3 w-3 mr-1" />
            Plan {planDisplayName}
          </Badge>
          <span className="text-sm text-muted-foreground">Actif</span>
        </div>
      );
    }

    return (
      <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={planColors[currentPlan]}>
                <PlanIcon className="h-3 w-3 mr-1" />
                Plan {planDisplayName}
              </Badge>
              <span className="font-medium">Abonnement actif</span>
              {feature && <span>• Accès à {feature}</span>}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // For free users - show limitations and upgrade prompts
  const hasReachedCVLimit = !canGenerateCV && remainingCVGenerations === 0;
  const hasReachedCoverLetterLimit = !canGenerateCoverLetter && remainingCoverLetterGenerations === 0;
  const isNearLimit = remainingCVGenerations <= 1 || remainingCoverLetterGenerations <= 1;

  if (compact) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline">
          <PlanIcon className="h-3 w-3 mr-1" />
          Plan {planDisplayName}
        </Badge>
        {isNearLimit && (
          <span className="text-sm text-orange-600">
            Limite bientôt atteinte
          </span>
        )}
      </div>
    );
  }

  return (
    <Alert className={`mb-4 ${hasReachedCVLimit || hasReachedCoverLetterLimit ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'}`}>
      <AlertTriangle className={`h-4 w-4 ${hasReachedCVLimit || hasReachedCoverLetterLimit ? 'text-red-600' : 'text-orange-600'}`} />
      <AlertDescription className={hasReachedCVLimit || hasReachedCoverLetterLimit ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-white dark:bg-background">
              <PlanIcon className="h-3 w-3 mr-1" />
              Plan {planDisplayName}
            </Badge>
            <span className="font-medium">
              {hasReachedCVLimit || hasReachedCoverLetterLimit 
                ? "Limite atteinte" 
                : "Essai gratuit"
              }
            </span>
            {!hasReachedCVLimit && !hasReachedCoverLetterLimit && (
              <span className="text-sm">
                • {remainingCVGenerations} CV restant{remainingCVGenerations > 1 ? 's' : ''}
                • {remainingCoverLetterGenerations} lettre{remainingCoverLetterGenerations > 1 ? 's' : ''} restante{remainingCoverLetterGenerations > 1 ? 's' : ''}
              </span>
            )}
            {feature && (
              <span className="text-sm">
                • {feature} nécessite un plan premium
              </span>
            )}
          </div>
          {showUpgradeButton && (
            <div className="flex gap-2">
              <Link href="/pricing">
                <Button size="sm" variant="default">
                  Passer au Premium
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Composant pour afficher des indicateurs de statut dans les en-têtes
export function PlanStatusIndicator() {
  const { currentPlan, isPremiumUser, isLoading } = useSubscription();

  if (isLoading) {
    return <div className="w-16 h-5 bg-muted animate-pulse rounded"></div>;
  }

  const PlanIcon = planIcons[currentPlan];
  const planDisplayName = {
    debutant: "Gratuit",
    pro: "Pro",
    expert: "Expert"
  }[currentPlan];

  return (
    <Badge 
      variant={isPremiumUser ? "default" : "outline"}
      className={isPremiumUser ? planColors[currentPlan] : ""}
      data-testid="plan-status-indicator"
    >
      <PlanIcon className="h-3 w-3 mr-1" />
      {planDisplayName}
    </Badge>
  );
}