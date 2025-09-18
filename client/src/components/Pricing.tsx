import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const plans = [
  {
    name: "Débutant",
    price: "0€",
    period: "Gratuit",
    description: "Parfait pour commencer",
    icon: Zap,
    badge: "Gratuit",
    features: [
      "1 CV analysé par l'IA",
      "Conseils de base",
      "1 lettre de motivation",
      "Export PDF basique",
      "Support email"
    ],
    cta: "Choisir ce plan",
    popular: false
  },
  {
    name: "Pro",
    price: "20€",
    period: "par mois",
    description: "Idéal pour une recherche active",
    icon: Crown,
    badge: "Populaire",
    features: [
      "CV illimités avec IA",
      "Conseils personnalisés avancés",
      "Lettres illimitées",
      "Templates premium",
      "Export PDF haute qualité",
      "Chat IA 24/7",
      "Support prioritaire"
    ],
    cta: "Choisir ce plan",
    popular: true
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
      "API accès",
      "Statistiques avancées",
      "Support téléphonique"
    ],
    cta: "Choisir ce plan",
    popular: false
  }
];

export function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choisis ton plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des tarifs transparents, sans engagement. Commence gratuitement 
            et évolue selon tes besoins de recherche d'emploi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`hover-elevate transition-all duration-300 relative ${
                plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
              }`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    <plan.icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button 
                  className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                  data-testid={`button-select-${plan.name.toLowerCase()}`}
                >
                  <Link href={isAuthenticated ? "/dashboard" : "/wizard"}>
                    {plan.cta}
                  </Link>
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Tous les plans incluent un essai gratuit de 7 jours • Annulation facile à tout moment
          </p>
        </div>
      </div>
    </section>
  );
}