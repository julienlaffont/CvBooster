import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// TODO: Remove mock data - replace with real testimonials from API
const testimonials = [
  {
    name: "Marie Dubois",
    role: "Développeuse Frontend",
    company: "StartupTech",
    content: "J'ai décroché 3 entretiens en 2 semaines après avoir utilisé CVBooster. L'IA a transformé mon CV de manière incroyable !",
    rating: 5,
    avatar: "MD"
  },
  {
    name: "Thomas Martin",
    role: "Chef de Projet",
    company: "FinanceCorpAvant",
    content: "Les conseils personnalisés m'ont aidé à adapter mon CV au secteur financier. Résultat : embauché dans ma première candidature !",
    rating: 5,
    avatar: "TM"
  },
  {
    name: "Sophie Laurent",
    role: "Responsable Marketing",
    company: "AgenceCreative",
    content: "L'interface est intuitive et les suggestions de l'IA sont pertinentes. Mon CV n'a jamais été aussi professionnel.",
    rating: 5,
    avatar: "SL"
  },
  {
    name: "Alex Petit",
    role: "Ingénieur DevOps",
    company: "CloudTech",
    content: "Excellent service ! L'export PDF est impeccable et les lettres de motivation générées sont vraiment personnalisées.",
    rating: 5,
    avatar: "AP"
  },
  {
    name: "Emma Rousseau",
    role: "UX Designer",
    company: "DesignStudio",
    content: "CVBooster a révolutionné ma recherche d'emploi. L'IA comprend vraiment les besoins spécifiques du design.",
    rating: 5,
    avatar: "ER"
  },
  {
    name: "Lucas Bernard",
    role: "Data Scientist",
    company: "AILab",
    content: "Interface claire, résultats rapides, et surtout une IA qui donne des conseils de qualité. Je recommande vivement !",
    rating: 5,
    avatar: "LB"
  }
];

export function Testimonials() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4" data-testid="badge-social-proof">
            +5000 CV améliorés
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ils ont transformé leur carrière
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvre comment nos utilisateurs ont boosté leurs candidatures 
            et décroché le job de leurs rêves grâce à CVBooster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300"
              data-testid={`card-testimonial-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <blockquote className="text-sm leading-relaxed mb-4 text-muted-foreground">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm" data-testid={`text-name-${index}`}>
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`text-role-${index}`}>
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}