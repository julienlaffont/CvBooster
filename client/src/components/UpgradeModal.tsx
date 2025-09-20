import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Rocket, X } from "lucide-react";
import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'cv' | 'cover-letter' | 'feature';
  feature?: string;
}

const plans = [
  {
    name: "Pro",
    price: "20€",
    period: "par mois",
    description: "Idéal pour une recherche active",
    icon: Crown,
    badge: "Populaire",
    features: [
      "CV illimités avec IA",
      "Lettres illimitées",
      "Templates premium",
      "Chat IA 24/7",
      "Support prioritaire"
    ],
    popular: true,
    planId: 'pro'
  },
  {
    name: "Expert",
    price: "50€",
    period: "par mois", 
    description: "Pour les professionnels exigeants",
    icon: Rocket,
    badge: "Complet",
    features: [
      "Tout de Pro +",
      "Analyse concurrentielle",
      "Optimisation ATS",
      "Coaching carrière 1-à-1",
      "Templates exclusifs",
      "Statistiques avancées"
    ],
    popular: false,
    planId: 'expert'
  }
];

export function UpgradeModal({ isOpen, onClose, type = 'feature', feature }: UpgradeModalProps) {
  const { currentPlan, remainingCVGenerations, remainingCoverLetterGenerations } = useSubscription();

  const getMessage = () => {
    if (type === 'cv') {
      const remaining = remainingCVGenerations;
      return {
        title: remaining === 0 ? "Limite de CV gratuits atteinte" : "Passez au niveau supérieur !",
        description: remaining === 0 
          ? "Vous avez utilisé vos 3 générations de CV gratuites. Choisissez un plan pour continuer à créer des CV illimités avec l'IA."
          : `Il vous reste ${remaining} génération${remaining > 1 ? 's' : ''} de CV gratuite${remaining > 1 ? 's' : ''}. Passez à un plan payant pour des générations illimitées.`,
        cta: "Générer plus de CV"
      };
    } else if (type === 'cover-letter') {
      const remaining = remainingCoverLetterGenerations;
      return {
        title: remaining === 0 ? "Limite de lettres gratuites atteinte" : "Passez au niveau supérieur !",
        description: remaining === 0 
          ? "Vous avez utilisé vos 3 générations de lettres gratuites. Choisissez un plan pour continuer à créer des lettres illimitées avec l'IA."
          : `Il vous reste ${remaining} génération${remaining > 1 ? 's' : ''} de lettre${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''}. Passez à un plan payant pour des générations illimitées.`,
        cta: "Générer plus de lettres"
      };
    } else {
      return {
        title: feature ? `Fonctionnalité ${feature} Premium` : "Débloquez plus de fonctionnalités",
        description: feature 
          ? `La fonctionnalité "${feature}" est disponible avec les plans Pro et Expert. Choisissez votre plan pour débloquer cette fonctionnalité et bien plus encore.`
          : "Débloquez toutes les fonctionnalités premium avec nos plans Pro et Expert. Générations illimitées, templates exclusifs, et bien plus encore.",
        cta: "Découvrir les plans"
      };
    }
  };

  const message = getMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              data-testid="button-close-upgrade-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl font-bold mb-2">
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`hover-elevate transition-all duration-300 relative ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}
              data-testid={`upgrade-plan-${plan.name.toLowerCase()}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  {plan.badge}
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <plan.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/subscribe?plan=${plan.planId}`}>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={onClose}
                    data-testid={`button-choose-${plan.name.toLowerCase()}`}
                  >
                    Choisir ce plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex-col space-y-4 sm:space-y-0 mt-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Garantie satisfait ou remboursé 30 jours • Sans engagement</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-maybe-later">
              Plus tard
            </Button>
            <Link href="/pricing" className="flex-1">
              <Button className="w-full" onClick={onClose} data-testid="button-view-all-plans">
                Voir tous les plans
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}