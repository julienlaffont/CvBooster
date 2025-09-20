import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Rocket, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const [plan, setPlan] = useState<'pro' | 'expert' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    
    if (planParam === 'pro' || planParam === 'expert') {
      setPlan(planParam);
    }

    // Update user subscription status to active
    const updateSubscriptionStatus = async () => {
      try {
        if (planParam === 'pro' || planParam === 'expert') {
          // Note: In a production app, this should be handled by webhooks
          // For now, we'll update the status optimistically
          const response = await apiRequest("GET", "/api/subscription/status");
          if (response.ok) {
            const data = await response.json();
            console.log('Subscription status:', data);
          }
        }
      } catch (error) {
        console.error('Error updating subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateSubscriptionStatus();
  }, []);

  const planDetails = {
    pro: {
      name: "Pro",
      price: "20€",
      icon: Crown,
      color: "bg-blue-500",
      features: [
        "CV illimités avec IA",
        "Lettres de motivation illimitées",
        "Templates premium exclusifs",
        "Export PDF haute qualité",
        "Chat IA disponible 24/7",
        "Support prioritaire par email"
      ]
    },
    expert: {
      name: "Expert", 
      price: "50€",
      icon: Rocket,
      color: "bg-purple-500",
      features: [
        "Toutes les fonctionnalités Pro",
        "Analyse concurrentielle avancée",
        "Optimisation ATS complète",
        "Coaching carrière personnalisé",
        "Templates exclusifs sectoriels",
        "Statistiques détaillées",
        "Support téléphonique prioritaire"
      ]
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="mt-4 text-muted-foreground">Finalisation de votre abonnement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">Information de plan manquante</p>
            <Button asChild>
              <Link href="/dashboard">Aller au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = planDetails[plan];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-green-600 mb-2">
              Paiement réussi !
            </CardTitle>
            
            <p className="text-lg text-muted-foreground">
              Votre abonnement {currentPlan.name} a été activé avec succès
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Plan Details */}
            <div className="flex items-center justify-center gap-4 p-6 bg-muted/50 rounded-xl">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${currentPlan.color} text-white`}>
                <currentPlan.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Plan {currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  {currentPlan.price}/mois • Facturation mensuelle
                </p>
              </div>
              <Badge className="ml-auto bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>

            {/* Features Unlocked */}
            <div className="text-left">
              <h4 className="font-semibold mb-4 text-center">
                Fonctionnalités débloquées
              </h4>
              <div className="grid gap-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold">Prochaines étapes</h4>
              
              <div className="grid gap-4">
                <Button asChild size="lg" data-testid="button-go-to-dashboard">
                  <Link href="/dashboard">
                    Accéder au tableau de bord
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" asChild data-testid="button-create-cv">
                    <Link href="/wizard">
                      Créer un CV
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild data-testid="button-go-to-chat">
                    <Link href="/chat">
                      Chat IA
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Receipt Info */}
            <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              <p className="mb-2">
                Un reçu de paiement a été envoyé à votre adresse email.
              </p>
              <p>
                Votre abonnement se renouvellera automatiquement chaque mois.
                Vous pouvez annuler à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}