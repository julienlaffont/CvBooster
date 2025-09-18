import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// Import AI-generated photos
import testimonial1Photo from "@assets/generated_images/Young_professional_Black_woman_caca3656.png";
import testimonial2Photo from "@assets/generated_images/Professional_Caucasian_man_executive_584fa5c3.png";
import testimonial3Photo from "@assets/generated_images/Professional_Asian_woman_portrait_112e0cfb.png";
import testimonial4Photo from "@assets/generated_images/Professional_Latino_man_headshot_5c119232.png";
import testimonial5Photo from "@assets/generated_images/Professional_Middle_Eastern_woman_9376b3ee.png";
import testimonial6Photo from "@assets/generated_images/Professional_Indian_man_portrait_701b5ed1.png";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Marketing Manager",
    company: "TechVision",
    content: "CVBooster a complètement transformé ma recherche d'emploi ! L'analyse IA a identifié des points que je n'aurais jamais vus. J'ai décroché mon poste de rêve en 3 semaines.",
    rating: 5,
    image: testimonial1Photo,
    sector: "Marketing Digital"
  },
  {
    name: "Alexandre D.",
    role: "Directeur Financier",
    company: "InvestCorp",
    content: "En tant qu'executive, je pensais maîtriser les CV. L'outil m'a prouvé le contraire ! Les conseils sectoriels finance étaient parfaits. Promotion obtenue !",
    rating: 5,
    image: testimonial2Photo,
    sector: "Finance"
  },
  {
    name: "Li Chen",
    role: "UX Designer",
    company: "CreativeHub",
    content: "L'amélioration de photo IA est bluffante ! Ma photo LinkedIn a été transformée et j'ai eu 40% de vues en plus sur mon profil. Résultat : plusieurs opportunités !",
    rating: 5,
    image: testimonial3Photo,
    sector: "Design"
  },
  {
    name: "Carlos R.",
    role: "Ingénieur DevOps",
    company: "PayTech",
    content: "Le chat IA 24/7 m'a préparé pour mes entretiens techniques. Les questions étaient précises, les conseils pertinents. J'ai négocié +25% de salaire !",
    rating: 5,
    image: testimonial4Photo,
    sector: "Tech"
  },
  {
    name: "Leila K.",
    role: "Consultante Strategy",
    company: "McKinsey & Co",
    content: "Les lettres de motivation générées sont d'une qualité exceptionnelle. Chaque candidature était unique et impactante. Taux de réponse multiplié par 3 !",
    rating: 5,
    image: testimonial5Photo,
    sector: "Consulting"
  },
  {
    name: "Raj P.",
    role: "Product Manager",
    company: "E-Shop Plus",
    content: "L'export professionnel avec templates premium fait la différence. Mon CV ressort du lot et les recruteurs me contactent directement. Excellent investissement !",
    rating: 5,
    image: testimonial6Photo,
    sector: "Product"
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
                    <AvatarImage src={testimonial.image} alt={`Photo de ${testimonial.name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
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