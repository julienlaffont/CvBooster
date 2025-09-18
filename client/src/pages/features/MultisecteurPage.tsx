import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Code, Heart, DollarSign, Briefcase, Lightbulb, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function MultisecteurPage() {
  const { isAuthenticated } = useAuth();

  const sectors = [
    { icon: Code, name: "Technologie", count: "15+", color: "text-blue-600" },
    { icon: Heart, name: "Santé", count: "8+", color: "text-red-600" },
    { icon: DollarSign, name: "Finance", count: "12+", color: "text-green-600" },
    { icon: Briefcase, name: "Consulting", count: "6+", color: "text-purple-600" },
    { icon: Lightbulb, name: "Marketing", count: "10+", color: "text-orange-600" },
    { icon: Users, name: "Ressources Humaines", count: "5+", color: "text-pink-600" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-4 w-4 mr-2" />
              50+ secteurs couverts
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Multi-secteurs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Des conseils adaptés à ton domaine professionnel : Tech, Marketing, Finance, 
              Santé, et bien plus. Notre IA comprend les spécificités de chaque secteur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-find-sector"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/wizard"}>
                  Trouver mon secteur
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                data-testid="button-see-sectors"
              >
                <Link href="#sectors">
                  Voir tous les secteurs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Sectors */}
        <section id="sectors" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Secteurs les plus populaires
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Notre IA est spécialisée dans une large gamme de secteurs 
                avec des conseils sur-mesure pour chaque domaine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {sectors.map((sector, index) => (
                <Card key={index} className="hover-elevate transition-all duration-300 group cursor-pointer">
                  <CardHeader className="text-center">
                    <div className={`mx-auto h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors`}>
                      <sector.icon className={`h-8 w-8 ${sector.color}`} />
                    </div>
                    <CardTitle className="text-xl">{sector.name}</CardTitle>
                    <Badge variant="secondary" className="mx-auto">
                      {sector.count} sous-secteurs
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      Conseils spécialisés et mots-clés adaptés au secteur {sector.name.toLowerCase()}.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sector Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Pourquoi une approche secteur par secteur ?
                </h3>
                <div className="space-y-4">
                  {[
                    "Mots-clés spécifiques à ton domaine d'activité",
                    "Compétences valorisées selon ton secteur",
                    "Formats de CV adaptés aux usages de ta branche",
                    "Conseils de carrière personnalisés",
                    "Exemples de réalisations pertinentes",
                    "Codes culturels et attentes des recruteurs",
                    "Tendances et évolutions du marché",
                    "Salaires et négociations selon le secteur"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="p-8 bg-muted/30">
                <div className="text-center space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">50+</div>
                    <p className="text-sm text-muted-foreground">
                      Secteurs et sous-secteurs couverts
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">10k+</div>
                    <p className="text-sm text-muted-foreground">
                      Profils analysés par secteur
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">95%</div>
                    <p className="text-sm text-muted-foreground">
                      Pertinence des conseils sectoriels
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* All Sectors */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tous les secteurs disponibles
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "Aéronautique", "Agriculture", "Architecture", "Automobile",
                "Banque", "BTP", "Chimie", "Commerce",
                "Communication", "Consulting", "Culture", "Design",
                "E-commerce", "Éducation", "Énergie", "Environnement",
                "Finance", "Fonction publique", "Hôtellerie", "Immobilier",
                "Industrie", "Informatique", "Journalisme", "Juridique",
                "Logistique", "Luxe", "Marketing", "Médical",
                "Mode", "ONG", "Pharmacie", "Recherche",
                "Ressources humaines", "Restauration", "Retail", "Santé",
                "Sécurité", "Sport", "Startups", "Tech",
                "Télécommunications", "Tourisme", "Transport", "Urbanisme"
              ].map((sector, index) => (
                <div key={index} className="bg-background rounded-lg p-3 text-center hover-elevate transition-all duration-200 cursor-pointer">
                  <span className="text-sm font-medium">{sector}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Ne trouves pas ton secteur ? Notre IA s'adapte à tous les domaines professionnels.
              </p>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Témoignages par secteur
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Code className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Tech - Développement</CardTitle>
                      <p className="text-sm text-muted-foreground">Sarah, Lead Developer</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "Les conseils tech étaient parfaits ! L'IA a mis en avant mes compétences 
                    en React et mes projets GitHub. Embauché chez une scale-up en 3 semaines."
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Finance - Investment</CardTitle>
                      <p className="text-sm text-muted-foreground">Marc, Analyst</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "Approach très pointue sur la finance. L'IA a valorisé mes certifications 
                    CFA et mon expérience en M&A. Résultat : Big 4 en poche !"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trouve les conseils parfaits pour ton secteur
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Que tu sois en tech, finance, santé ou tout autre domaine, 
              notre IA adapte ses recommandations à ton secteur d'activité.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-sector-analysis"
            >
              <Link href="/wizard">
                Analyser pour mon secteur
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