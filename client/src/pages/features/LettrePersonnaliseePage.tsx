import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function LettrePersonnaliseePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Génération automatique
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Lettres Personnalisées
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Génère des lettres de motivation uniques et impactantes, adaptées à chaque poste 
              et secteur d'activité en quelques secondes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-create-letter"
              >
                <Link href={isAuthenticated ? "/cover-letter" : "/cover-letter"}>
                  Créer ma lettre
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                data-testid="button-see-examples"
              >
                <Link href="#examples">
                  Voir des exemples
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
                Pourquoi nos lettres sont différentes ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fini les lettres génériques ! Notre IA crée des lettres authentiques 
                qui reflètent ta personnalité et correspondent parfaitement au poste.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Personnalisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Chaque lettre est unique et adaptée au poste et à l'entreprise visés.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Ton naturel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Un style authentique qui correspond à ta personnalité professionnelle.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Rapide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Génération en moins de 30 secondes, prête à envoyer.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Secteurs spécialisés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Adaptée aux codes de ton secteur : Tech, Finance, Santé, etc.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Process */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Comment ça marche ?
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold mb-2">Renseigne le poste</h4>
                      <p className="text-muted-foreground text-sm">
                        Indique l'intitulé du poste, l'entreprise et le secteur d'activité.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold mb-2">L'IA analyse</h4>
                      <p className="text-muted-foreground text-sm">
                        Notre IA comprend les exigences du poste et ton profil.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold mb-2">Lettre générée</h4>
                      <p className="text-muted-foreground text-sm">
                        Reçois une lettre personnalisée, structurée et convaincante.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="p-8 bg-muted/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">30s</div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Temps moyen de génération
                  </p>
                  <div className="text-2xl font-bold text-primary mb-2">50+</div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Secteurs d'activité couverts
                  </p>
                  <div className="text-2xl font-bold text-primary mb-2">92%</div>
                  <p className="text-sm text-muted-foreground">
                    Taux de satisfaction utilisateur
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prête à impressionner les recruteurs ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Crée dès maintenant des lettres de motivation qui se démarquent 
              et augmentent tes chances d'obtenir un entretien.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-letter"
            >
              <Link href="/cover-letter">
                Créer ma première lettre
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