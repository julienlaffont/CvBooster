import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Rocket, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

// Initialize Stripe conditionally to avoid crashes
let stripePromise: Promise<any> | null = null;

const initializeStripe = () => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

interface SubscribeFormProps {
  plan: 'pro' | 'expert';
  clientSecret: string;
}

const SubscribeForm = ({ plan, clientSecret }: SubscribeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success?plan=${plan}`,
      },
    });

    if (error) {
      toast({
        title: "Échec du paiement",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Paiement réussi",
        description: "Votre abonnement a été activé avec succès !",
      });
      setLocation('/subscription/success');
    }

    setIsLoading(false);
  };

  const planDetails = {
    pro: {
      name: "Pro",
      price: "20€",
      icon: Crown,
      features: [
        "CV illimités avec IA",
        "Lettres illimitées",
        "Templates premium",
        "Export PDF haute qualité",
        "Chat IA 24/7",
        "Support prioritaire"
      ]
    },
    expert: {
      name: "Expert", 
      price: "50€",
      icon: Rocket,
      features: [
        "Tout de Pro +",
        "Analyse concurrentielle",
        "Optimisation ATS",
        "Coaching carrière 1-à-1",
        "Templates exclusifs",
        "Statistiques avancées",
        "Support téléphonique"
      ]
    }
  };

  const currentPlan = planDetails[plan];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild data-testid="button-back-to-pricing">
            <Link href="/#pricing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux tarifs
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <currentPlan.icon className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-2xl">Plan {currentPlan.name}</CardTitle>
              <div className="text-3xl font-bold text-primary">
                {currentPlan.price}
                <span className="text-base font-normal text-muted-foreground">/mois</span>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                Abonnement mensuel
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Facturation mensuelle automatique</p>
                  <p>• Annulation possible à tout moment</p>
                  <p>• Activation immédiate après paiement</p>
                  <p>• Essai gratuit de 7 jours inclus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
              <p className="text-sm text-muted-foreground">
                Paiement sécurisé par Stripe
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 border border-border rounded-lg">
                  <PaymentElement 
                    data-testid="stripe-payment-element"
                    options={{
                      layout: 'tabs',
                      paymentMethodOrder: ['card'],
                    }}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!stripe || !elements || isLoading}
                  className="w-full"
                  size="lg"
                  data-testid="button-confirm-payment"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Traitement en cours...
                    </div>
                  ) : (
                    `Confirmer l'abonnement ${currentPlan.price}/mois`
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  En confirmant votre abonnement, vous acceptez nos conditions d'utilisation
                  et notre politique de confidentialité. Votre abonnement sera renouvelé
                  automatiquement chaque mois.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState<'pro' | 'expert'>('pro');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    
    if (planParam === 'pro' || planParam === 'expert') {
      setPlan(planParam);
    } else {
      toast({
        title: "Plan non spécifié",
        description: "Redirection vers la page des tarifs",
        variant: "destructive",
      });
      window.location.href = '/#pricing';
      return;
    }

    // Check for Stripe key configuration
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      setError("Configuration Stripe manquante. Contactez le support.");
      setIsLoading(false);
      return;
    }

    // Create subscription
    const createSubscription = async () => {
      try {
        const response = await apiRequest("POST", "/api/subscription/create", { 
          plan: planParam 
        });
        
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Authentification requise",
            description: "Veuillez vous connecter pour souscrire à un abonnement",
            variant: "destructive",
          });
          setLocation('/wizard?redirect=subscribe&plan=' + planParam);
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create subscription');
        }
      } catch (error: any) {
        console.error('Error creating subscription:', error);
        setError(error.message || "Impossible de configurer l'abonnement");
        toast({
          title: "Erreur de configuration",
          description: error.message || "Impossible de configurer l'abonnement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="mt-4 text-muted-foreground">Configuration de votre abonnement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button asChild>
              <Link href="/#pricing">Retour aux tarifs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">Erreur de configuration de l'abonnement</p>
            <Button asChild>
              <Link href="/#pricing">Retour aux tarifs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initialize Stripe and make sure we have a valid promise
  const stripe = initializeStripe();
  if (!stripe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">Configuration Stripe manquante</p>
            <Button asChild>
              <Link href="/#pricing">Retour aux tarifs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <SubscribeForm plan={plan} clientSecret={clientSecret} />
    </Elements>
  );
}