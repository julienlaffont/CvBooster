import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, Sparkles, Eye, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function PhotoIAPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Camera className="h-4 w-4 mr-2" />
              Photo Pro IA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Amélioration Photo IA
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transforme ta photo de profil avec l'intelligence artificielle : 
              fond neutre, luminosité professionnelle et style corporate en un clic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-improve-photo"
              >
                <Link href="/photo">
                  Améliorer ma photo
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                data-testid="button-see-before-after"
              >
                <Link href="#before-after">
                  Avant / Après
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Une photo parfaite en quelques clics
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Notre IA analyse ta photo et applique automatiquement les corrections 
                nécessaires pour une présentation professionnelle impeccable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Fond automatique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Remplacement intelligent du fond par un arrière-plan neutre et professionnel.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Luminosité optimale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ajustement automatique de la luminosité pour un rendu parfait.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Style corporate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Application du style vestimentaire et de présentation corporate.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Qualité HD</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Amélioration de la résolution et de la netteté pour un rendu professionnel.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Pourquoi optimiser ta photo de profil ?
                </h3>
                <div className="space-y-4">
                  {[
                    "Première impression déterminante pour 93% des recruteurs",
                    "Augmente de 40% les chances d'être contacté",
                    "Transmet un message de professionnalisme",
                    "Améliore la crédibilité de ton profil",
                    "Respecte les codes du monde corporate",
                    "Compatible avec tous les réseaux professionnels"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="p-8 bg-muted/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">93%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    des recruteurs regardent la photo en premier
                  </p>
                  <div className="text-2xl font-bold text-primary mb-2">+40%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    de chances d'être contacté
                  </p>
                  <div className="text-2xl font-bold text-primary mb-2">3s</div>
                  <p className="text-sm text-muted-foreground">
                    Temps de traitement moyen
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comment ça fonctionne ?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">1</div>
                <h3 className="font-semibold mb-2">Upload ta photo</h3>
                <p className="text-muted-foreground text-sm">
                  Télécharge ta photo actuelle depuis ton appareil
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">2</div>
                <h3 className="font-semibold mb-2">L'IA analyse</h3>
                <p className="text-muted-foreground text-sm">
                  Notre technologie identifie et optimise tous les éléments
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">3</div>
                <h3 className="font-semibold mb-2">Télécharge le résultat</h3>
                <p className="text-muted-foreground text-sm">
                  Récupère ta photo optimisée prête pour LinkedIn ou ton CV
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transforme ta photo dès maintenant
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoins les milliers de professionnels qui ont optimisé 
              leur image de marque personnelle avec notre IA.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-photo-improvement"
            >
              <Link href="/photo">
                Commencer l'amélioration
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}