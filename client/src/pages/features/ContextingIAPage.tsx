import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, Users, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function ContextingIAPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat en direct
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Coaching IA 24/7
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Un assistant virtuel expert en recrutement disponible à tout moment 
              pour répondre à tes questions et te guider dans ta recherche d'emploi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-start-chat"
              >
                <Link href={isAuthenticated ? "/chat" : "/chat"}>
                  Commencer une conversation
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
                Un coach personnel à ta disposition
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Notre IA coach comprend les défis de la recherche d'emploi et t'accompagne 
                avec des conseils personnalisés et des réponses instantanées.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">24h/24 - 7j/7</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Disponible à tout moment, même le week-end et les jours fériés.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Expert RH</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Formé sur des milliers de données RH et de bonnes pratiques.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Personnalisé</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Conseils adaptés à ton profil, ton secteur et tes objectifs.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Conversationnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Interface naturelle comme avec un vrai coach carrière.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Use Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Dans quelles situations t'aider ?
                </h3>
                <div className="space-y-4">
                  {[
                    "Optimisation de CV et lettres de motivation",
                    "Préparation aux entretiens d'embauche",
                    "Stratégies de recherche d'emploi",
                    "Négociation salariale et avantages",
                    "Reconversion professionnelle",
                    "Développement de compétences",
                    "Networking et LinkedIn",
                    "Gestion du stress en recherche d'emploi"
                  ].map((useCase, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="p-8 bg-muted/30">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">98%</div>
                    <p className="text-sm text-muted-foreground">
                      Taux de satisfaction utilisateur
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">&lt; 5s</div>
                    <p className="text-sm text-muted-foreground">
                      Temps de réponse moyen
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                    <p className="text-sm text-muted-foreground">
                      Disponibilité garantie
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Exemples de conversations
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question CV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm"><strong>Toi :</strong> "Comment mettre en valeur une période de chômage sur mon CV ?"</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm"><strong>IA Coach :</strong> "Excellente question ! Voici 3 stratégies efficaces : 1) Mets l'accent sur les formations ou projets personnels réalisés, 2) Utilise un format fonctionnel plutôt que chronologique, 3) Sois transparent et positif sur cette période..."</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Préparation entretien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm"><strong>Toi :</strong> "J'ai un entretien demain pour un poste de développeur. Quelles questions vont-ils me poser ?"</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm"><strong>IA Coach :</strong> "Super ! Pour un poste de développeur, prépare-toi à ces questions classiques : 'Parlez-moi de votre expérience', 'Quels sont vos langages préférés ?', 'Comment gérez-vous les bugs ?'..."</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Commence ta conversation maintenant
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Ton coach IA t'attend pour t'accompagner dans toutes les étapes 
              de ta recherche d'emploi. Pose ta première question !
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-coaching"
            >
              <Link href="/chat">
                Poser ma première question
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