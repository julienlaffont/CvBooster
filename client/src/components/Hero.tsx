import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Typewriter } from "@/components/Typewriter";
import heroImg from "@assets/generated_images/Modern_professional_CV_template_74f056c7.png";

export function Hero() {
  const [, setLocation] = useLocation();
  
  const handleCVClick = () => {
    setLocation("/wizard");
  };
  
  const handleLetterClick = () => {
    setLocation("/cover-letter");
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-4 bg-gradient-to-b from-background to-background/50">
      {/* background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 dark:bg-purple-400/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-40 w-[36rem] bg-gradient-to-r from-primary/20 via-transparent to-fuchsia-400/10 blur-2xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <Badge variant="secondary" className="mb-4" data-testid="badge-new">
          <Star className="w-3 h-3 mr-1" />
          Essai gratuit: 1 CV + 1 lettre
        </Badge>
        
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center md:text-left">
            <h1 className="leading-tight font-extrabold mb-6 text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Crée ton CV parfait grâce à l'IA
              </span>
              <br />
              <Typewriter
                className="block mt-2 text-primary"
                words={[
                  "décroche plus d'entretiens",
                  "mets tes atouts en valeur",
                  "gagne du temps à chaque candidature",
                ]}
              />
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-12 max-w-2xl md:max-w-none">
              Utilise l'intelligence artificielle pour optimiser ton CV et tes lettres de motivation. 
              Reçois des conseils personnalisés selon ton secteur et augmente tes chances de succès.
              <br />
              <span className="text-primary font-medium">Commence gratuitement dès maintenant !</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center mb-10">
              <Button 
                size="lg" 
                className="text-lg px-8" 
                onClick={handleCVClick}
                data-testid="button-cta-cv"
              >
                Essayer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8"
                onClick={handleLetterClick}
                data-testid="button-cta-lettre"
              >
                Créer ma lettre gratuite
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl md:max-w-none">
              <div className="flex items-center gap-3" data-testid="feature-ai">
                <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Analyse IA avancée</span>
              </div>
              <div className="flex items-center gap-3" data-testid="feature-personalized">
                <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Conseils personnalisés</span>
              </div>
              <div className="flex items-center gap-3" data-testid="feature-export">
                <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Export PDF professionnel</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/30 via-purple-500/20 to-fuchsia-400/20 blur-2xl -z-10" />
            <div className="rounded-2xl overflow-hidden ring-1 ring-border/50 shadow-xl bg-white">
              <img
                src={heroImg}
                alt="Aperçu d'un CV professionnel"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}