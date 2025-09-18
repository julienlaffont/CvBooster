import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, FileText, Palette, Smartphone, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function ExportProfessionnelPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Download className="h-4 w-4 mr-2" />
              PDF Haute Qualité
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Export Professionnel
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Télécharge tes documents optimisés en PDF haute définition avec des templates 
              modernes et élégants qui impressionnent les recruteurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                data-testid="button-try-export"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/wizard"}>
                  Créer mon CV
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                data-testid="button-see-templates"
              >
                <Link href="#templates">
                  Voir les templates
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
                Des exports de qualité professionnelle
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chaque document est optimisé pour créer la meilleure première impression 
                avec une qualité d'impression impeccable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">PDF Haute Qualité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Résolution optimale pour impression et affichage numérique.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Templates Modernes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Designs contemporains qui respectent les codes de ton secteur.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">ATS Compatible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Formats optimisés pour les systèmes de recrutement automatisés.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Export Instantané</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Téléchargement immédiat en un clic, prêt à envoyer.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Templates Preview */}
            <div id="templates" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Templates disponibles
                </h3>
                <div className="space-y-4">
                  {[
                    { name: "Corporate Classic", desc: "Design épuré pour secteurs traditionnels" },
                    { name: "Creative Modern", desc: "Style créatif pour métiers artistiques" },
                    { name: "Tech Minimalist", desc: "Approche minimaliste pour la tech" },
                    { name: "Executive Premium", desc: "Élégance pour postes de direction" },
                    { name: "Fresh Graduate", desc: "Parfait pour jeunes diplômés" },
                    { name: "International", desc: "Standard mondial pour expatriation" }
                  ].map((template, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <p className="text-sm text-muted-foreground">{template.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="p-8 bg-muted/30">
                <div className="text-center space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">300 DPI</div>
                    <p className="text-sm text-muted-foreground">
                      Qualité d'impression professionnelle
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">A4</div>
                    <p className="text-sm text-muted-foreground">
                      Format standard international
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">1-2 pages</div>
                    <p className="text-sm text-muted-foreground">
                      Longueur optimale recommandée
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Spécifications techniques
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formats disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>PDF</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Word (.docx)</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Image (PNG)</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Qualité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Résolution</span>
                    <span className="font-medium">300 DPI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taille</span>
                    <span className="font-medium">A4 (210×297mm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Couleurs</span>
                    <span className="font-medium">CMJN + RVB</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compatibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>ATS Systems</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Impression</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <CheckCircle className="h-4 w-4 text-primary" />
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
              Prêt à créer ton CV parfait ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Commence dès maintenant et télécharge ton CV professionnel 
              dans le format de ton choix.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-start-export"
            >
              <Link href="/wizard">
                Créer mon CV maintenant
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