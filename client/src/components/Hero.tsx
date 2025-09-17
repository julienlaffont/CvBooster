import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function Hero() {
  const [, setLocation] = useLocation();
  
  const handleCVClick = () => {
    setLocation("/wizard");
  };
  
  const handleLetterClick = () => {
    setLocation("/cover-letter");
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto max-w-6xl text-center">
        <Badge variant="secondary" className="mb-4" data-testid="badge-new">
          <Star className="w-3 h-3 mr-1" />
          Nouveau: IA GPT-4 intégrée
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Crée ton CV parfait grâce à l'IA et
          <br />
          <span className="text-primary">décroche des entretiens plus rapidement</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Utilise l'intelligence artificielle pour optimiser ton CV et tes lettres de motivation. 
          Reçois des conseils personnalisés selon ton secteur et augmente tes chances de succès.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="text-lg px-8" 
            onClick={handleCVClick}
            data-testid="button-cta-cv"
          >
            Créer mon CV
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8"
            onClick={handleLetterClick}
            data-testid="button-cta-lettre"
          >
            Améliorer ma lettre de motivation
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center" data-testid="feature-ai">
            <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Analyse IA avancée</span>
          </div>
          <div className="flex items-center gap-3 justify-center" data-testid="feature-personalized">
            <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Conseils personnalisés</span>
          </div>
          <div className="flex items-center gap-3 justify-center" data-testid="feature-export">
            <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Export PDF professionnel</span>
          </div>
        </div>
      </div>
    </section>
  );
}