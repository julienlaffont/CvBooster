import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, MessageSquare, Download, Users, Zap, Camera } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Analyse IA Intelligente",
    description: "Notre IA analyse ton CV et identifie les points d'amélioration selon les standards du recrutement moderne.",
    badge: "IA GPT-4"
  },
  {
    icon: FileText,
    title: "Lettres Personnalisées",
    description: "Génère des lettres de motivation adaptées à chaque poste et secteur d'activité.",
    badge: "Automatique"
  },
  {
    icon: Camera,
    title: "Amélioration Photo IA",
    description: "Optimise ta photo de profil avec l'IA : fond neutre, luminosité professionnelle et style corporate.",
    badge: "Photo Pro"
  },
  {
    icon: MessageSquare,
    title: "Coaching IA 24/7",
    description: "Un assistant virtuel disponible à tout moment pour répondre à tes questions et te guider.",
    badge: "Chat en direct"
  },
  {
    icon: Download,
    title: "Export Professionnel",
    description: "Télécharge tes documents optimisés en PDF avec des templates modernes et élégants.",
    badge: "PDF HD"
  },
  {
    icon: Users,
    title: "Multi-secteurs",
    description: "Conseils adaptés à ton domaine : Tech, Marketing, Finance, Santé, et bien plus.",
    badge: "50+ secteurs"
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont tu as besoin pour réussir
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants et une IA avancée pour transformer tes candidatures 
            et maximiser tes chances de décrocher le poste de tes rêves.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300 cursor-pointer group"
              data-testid={`card-feature-${index}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}