import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, CheckCircle, ArrowLeft, Home } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CVExamples } from "@/components/CVExamples";
import { Link } from "wouter";

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Marketing Manager",
    company: "TechStart",
    image: "",
    rating: 5,
    content: "Grâce à CVBooster, j'ai transformé mon CV terne en un document professionnel qui fait vraiment la différence. Trois entretiens en une semaine !"
  },
  {
    name: "Thomas Martin",
    role: "Développeur Full-Stack",
    company: "InnovateLabs",
    image: "",
    rating: 5,
    content: "L'IA de CVBooster a identifié des points faibles dans mon CV que je n'avais jamais remarqués. Le résultat est bluffant et 100% ATS-friendly."
  },
  {
    name: "Sophie Laurent",
    role: "Chef de Projet",
    company: "Digital Solutions",
    image: "",
    rating: 5,
    content: "Templates premium magnifiques et conseils personnalisés selon mon secteur. J'ai décroché le poste de mes rêves en 2 semaines !"
  },
  {
    name: "Pierre Rousseau",
    role: "Commercial B2B",
    company: "SalesForce Pro",
    image: "",
    rating: 5,
    content: "L'export professionnel avec templates premium fait la différence. Mon CV ressort du lot et les recruteurs me contactent directement. Excellent investissement !"
  },
  {
    name: "Emma Bernard",
    role: "UX Designer",
    company: "CreativeHub",
    image: "",
    rating: 5,
    content: "L'analyse IA est redoutable : elle a repéré des incohérences que même mes amis RH n'avaient pas vues. Mon taux de réponse a triplé !"
  },
  {
    name: "Lucas Petit",
    role: "Ingénieur DevOps",
    company: "CloudTech",
    image: "",
    rating: 5,
    content: "Interface intuitive, résultats professionnels. CVBooster m'a fait gagner des heures de travail et m'a aidé à décrocher un poste senior."
  }
];

export default function TestimonialsPage() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Back to Menu Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4" data-testid="button-back-to-menu">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au menu
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6" data-testid="badge-social-proof">
            <CheckCircle className="h-3 w-3 mr-2" />
            +5000 CV transformés
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Ils ont transformé leur carrière avec CVBooster
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvre les témoignages authentiques de nos utilisateurs qui ont décroché 
            le job de leurs rêves grâce à nos CV optimisés par IA.
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ce qu'ils disent de nous</h2>
            <p className="text-muted-foreground">
              Des témoignages authentiques de professionnels qui ont boosté leur carrière
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
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  
                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <blockquote className="text-sm leading-relaxed mb-6 text-muted-foreground">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} alt={`Photo de ${testimonial.name}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold" data-testid={`text-name-${index}`}>
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`text-role-${index}`}>
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CV Examples Section */}
      <div className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Exemples de CV transformés</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvre quelques exemples de CV créés avec CVBooster. 
              Chaque CV est optimisé pour passer les filtres ATS et impressionner les recruteurs.
            </p>
          </div>
          
          <CVExamples />
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-muted-foreground">CV créés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">89%</div>
              <div className="text-muted-foreground">Taux de réponse amélioré</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-muted-foreground">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}