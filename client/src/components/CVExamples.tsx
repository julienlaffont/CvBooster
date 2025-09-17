import { Card } from "@/components/ui/card";
import modernCvImage from "@assets/generated_images/Modern_professional_CV_template_74f056c7.png";
import creativeCvImage from "@assets/generated_images/Creative_professional_resume_design_17335a3d.png";
import executiveCvImage from "@assets/generated_images/Executive_professional_CV_template_693b9e63.png";

export function CVExamples() {
  const examples = [
    {
      id: 1,
      title: "CV Moderne",
      description: "Design épuré et professionnel",
      image: modernCvImage,
      alt: "Exemple de CV moderne généré par IA"
    },
    {
      id: 2,
      title: "CV Créatif",
      description: "Layout élégant avec accents colorés",
      image: creativeCvImage,
      alt: "Exemple de CV créatif généré par IA"
    },
    {
      id: 3,
      title: "CV Exécutif",
      description: "Style premium pour postes seniors",
      image: executiveCvImage,
      alt: "Exemple de CV exécutif généré par IA"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30" data-testid="section-cv-examples">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Exemples de CV générés par l'IA
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez la qualité professionnelle de nos CV générés automatiquement. 
            Chaque design s'adapte à votre profil et optimise vos chances de décrocher un entretien.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {examples.map((example) => (
            <Card key={example.id} className="group hover-elevate" data-testid={`cv-example-${example.id}`}>
              <div className="aspect-[3/4] overflow-hidden bg-white rounded-t-lg">
                <img 
                  src={example.image} 
                  alt={example.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-card-foreground">
                  {example.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {example.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Chaque CV est personnalisé selon votre secteur d'activité et vos expériences
          </p>
        </div>
      </div>
    </section>
  );
}