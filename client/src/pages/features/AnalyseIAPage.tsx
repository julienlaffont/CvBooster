import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, FileText, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function AnalyseIAPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Brain className="h-4 w-4 mr-2" />
              Technologie GPT-4
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Analyse IA Intelligente
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Notre intelligence artificielle avancée analyse ton CV en profondeur et identifie 
              les points d'amélioration selon les standards du recrutement moderne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-try-analysis"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/wizard"}>
                  Analyser mon CV maintenant
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                data-testid="button-see-example"
              >
                <Link href="#examples">
                  Voir un exemple
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
                Comment fonctionne l'analyse IA ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Une technologie de pointe qui comprend les attentes des recruteurs 
                et optimise ton CV pour maximiser tes chances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Analyse du contenu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    L'IA examine chaque section de ton CV : expériences, compétences, formation
                    et identifie les points à améliorer.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Intelligence contextuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Adapte les recommandations selon ton secteur d'activité 
                    et le type de poste recherché.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Score et recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Reçois un score détaillé et des suggestions concrètes 
                    pour améliorer chaque aspect de ton CV.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Pourquoi utiliser l'analyse IA ?
                </h3>
                <div className="space-y-4">
                  {[
                    "Détection automatique des erreurs et incohérences",
                    "Optimisation pour les systèmes ATS (Applicant Tracking System)",
                    "Conseils personnalisés selon ton secteur d'activité",
                    "Amélioration du taux de réponse des recruteurs",
                    "Mise en valeur de tes points forts",
                    "Suggestions de mots-clés pertinents"
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
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    des utilisateurs améliorent leur taux de réponse
                  </p>
                  <div className="text-2xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">
                    plus de chances d'obtenir un entretien
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
              Prêt à optimiser ton CV ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoins des milliers d'utilisateurs qui ont transformé leur recherche d'emploi 
              grâce à notre analyse IA intelligente.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-analysis"
            >
              <Link href={isAuthenticated ? "/dashboard" : "/wizard"}>
                Commencer l'analyse
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