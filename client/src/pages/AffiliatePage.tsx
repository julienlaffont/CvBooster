import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Users, 
  TrendingUp, 
  Euro, 
  Link2, 
  Star, 
  Check,
  ArrowRight,
  Calculator,
  Target,
  Zap
} from "lucide-react";

const AffiliatePage = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Join affiliate program mutation
  const joinAffiliateMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/affiliate/join'),
    onSuccess: (data) => {
      toast({
        title: "Félicitations !",
        description: "Vous avez rejoint le programme d'affiliation avec succès.",
      });
      // Redirect to affiliate dashboard
      window.location.href = '/affiliate/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rejoindre le programme d'affiliation.",
        variant: "destructive",
      });
    },
  });

  const handleJoinProgram = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    
    joinAffiliateMutation.mutate();
  };

  const features = [
    {
      icon: Euro,
      title: "Commission attractive",
      description: "Gagnez 20% sur chaque vente (4€ pour Pro, 10€ pour Expert)",
    },
    {
      icon: Link2,
      title: "Liens uniques",
      description: "Suivez facilement vos conversions avec votre code personnel",
    },
    {
      icon: TrendingUp,
      title: "Suivi en temps réel",
      description: "Tableaux de bord détaillés avec statistiques complètes",
    },
    {
      icon: Users,
      title: "Support dédié",
      description: "Équipe support dédiée aux partenaires affiliés",
    },
  ];

  const benefits = [
    "Commission de 20% sur tous les abonnements",
    "Paiements automatiques mensuels",
    "Matériel marketing fourni",
    "Suivi des performances en temps réel",
    "Support dédié partenaire",
    "Aucun minimum de vente requis"
  ];

  const steps = [
    {
      number: "1",
      title: "Inscription",
      description: "Créez votre compte d'affilié gratuitement"
    },
    {
      number: "2", 
      title: "Obtenez votre lien",
      description: "Recevez votre lien unique de parrainage"
    },
    {
      number: "3",
      title: "Partagez",
      description: "Partagez avec vos contacts et réseaux"
    },
    {
      number: "4",
      title: "Gagnez",
      description: "Recevez 20% de commission sur chaque vente"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4" data-testid="badge-affiliate">
            Programme d'Affiliation CVBooster
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="title-hero">
            Gagnez de l'argent en aidant
            <span className="text-primary"> les autres à réussir</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="text-hero-description">
            Rejoignez notre programme d'affiliation et gagnez <strong>20% de commission</strong> sur chaque 
            vente que vous générez. Aidez vos contacts à améliorer leur CV tout en créant un revenu passif.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={handleJoinProgram}
              disabled={joinAffiliateMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-join-affiliate"
            >
              {joinAffiliateMutation.isPending ? (
                "Inscription en cours..."
              ) : isAuthenticated ? (
                <>
                  Rejoindre le programme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-learn-more">
              En savoir plus
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center" data-testid="stat-commission">
              <div className="text-3xl font-bold text-primary mb-2">20%</div>
              <div className="text-muted-foreground">Commission sur chaque vente</div>
            </div>
            <div className="text-center" data-testid="stat-payout">
              <div className="text-3xl font-bold text-primary mb-2">€4-10</div>
              <div className="text-muted-foreground">Gain par conversion</div>
            </div>
            <div className="text-center" data-testid="stat-payout-time">
              <div className="text-3xl font-bold text-primary mb-2">30j</div>
              <div className="text-muted-foreground">Délai de paiement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="title-features">
            Pourquoi devenir affilié CVBooster ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="title-how-it-works">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center" data-testid={`step-${index}`}>
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="title-benefits">
            Avantages du programme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3" data-testid={`benefit-${index}`}>
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Calculator */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="title-calculator">
            Calculateur de gains
          </h2>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Estimez vos revenus mensuels
              </CardTitle>
              <CardDescription>
                Voyez combien vous pourriez gagner avec notre programme d'affiliation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Plan Pro (20€/mois)</div>
                  <div className="text-2xl font-bold text-primary">4€</div>
                  <div className="text-xs text-muted-foreground">par conversion</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Plan Expert (50€/mois)</div>
                  <div className="text-2xl font-bold text-primary">10€</div>
                  <div className="text-xs text-muted-foreground">par conversion</div>
                </Card>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-center space-y-2">
                  <div className="text-lg font-medium">Exemples de gains mensuels :</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>5 conversions Pro = <strong>20€</strong></div>
                    <div>3 conversions Expert = <strong>30€</strong></div>
                    <div>10 conversions Pro = <strong>40€</strong></div>
                    <div>10 conversions Expert = <strong>100€</strong></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="title-cta">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des centaines d'affiliés qui gagnent déjà avec CVBooster
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleJoinProgram}
            disabled={joinAffiliateMutation.isPending}
            className="text-primary"
            data-testid="button-cta-join"
          >
            {joinAffiliateMutation.isPending ? (
              "Inscription en cours..."
            ) : (
              <>
                Rejoindre maintenant
                <Zap className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </section>

      {!isAuthenticated && showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>
                Vous devez être connecté pour rejoindre le programme d'affiliation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/login'}
                data-testid="button-login"
              >
                Se connecter
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/register'}
                data-testid="button-register"
              >
                Créer un compte
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowLogin(false)}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AffiliatePage;