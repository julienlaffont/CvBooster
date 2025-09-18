import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "Est-ce que mon CV sera compatible ATS ?",
    answer: "Absolument ! Notre IA est spécialement entraînée pour optimiser vos CV selon les critères des ATS (Applicant Tracking Systems). Nous analysons la structure, les mots-clés sectoriels et le formatage pour maximiser vos chances de passer les filtres automatiques des recruteurs."
  },
  {
    question: "Puis-je télécharger mon CV en PDF ?",
    answer: "Oui, vous pouvez exporter vos CV optimisés en PDF haute qualité. Nos templates sont conçus pour un rendu professionnel à l'impression et à l'écran, avec plusieurs formats disponibles selon votre secteur d'activité."
  },
  {
    question: "L'IA fonctionne-t-elle pour tous les secteurs ?",
    answer: "Notre IA est formée sur plus de 50 secteurs d'activité : Tech, Finance, Marketing, Santé, Ingénierie, Juridique, et bien d'autres. Elle adapte ses conseils et recommandations selon votre domaine professionnel et les standards spécifiques à votre industrie."
  },
  {
    question: "Combien de temps faut-il pour générer un CV ?",
    answer: "L'analyse et la génération d'un CV optimisé prennent généralement entre 30 secondes et 2 minutes. Le temps varie selon la complexité de votre profil et le niveau d'optimisation demandé. Notre IA travaille en temps réel pour vous fournir des résultats rapides."
  },
  {
    question: "Mes données personnelles sont-elles sécurisées ?",
    answer: "La sécurité de vos données est notre priorité absolue. Toutes les informations sont chiffrées, stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous gardez le contrôle total sur vos données et pouvez les supprimer à tout moment."
  },
  {
    question: "Puis-je modifier un CV après génération ?",
    answer: "Bien sûr ! Après génération, vous pouvez modifier tous les éléments de votre CV : texte, structure, design. Notre éditeur intuitif vous permet d'ajuster chaque section tout en conservant l'optimisation IA. Vous pouvez aussi regénérer des parties spécifiques."
  },
  {
    question: "Y a-t-il une garantie de satisfaction ?",
    answer: "Nous offrons une garantie satisfait ou remboursé de 30 jours sur tous nos plans payants. Si vous n'êtes pas entièrement satisfait de nos services, nous vous remboursons intégralement sans poser de questions."
  }
];

export function FAQ() {
  return (
    <section className="py-20 px-4" data-testid="section-faq">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Questions fréquentes
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus posées sur CVBooster. 
            Notre équipe est également disponible pour vous accompagner.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-card hover-elevate"
              data-testid={`faq-item-${index}`}
            >
              <AccordionTrigger 
                className="text-left font-medium hover:no-underline py-6"
                data-testid={`faq-question-${index}`}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent 
                className="text-muted-foreground pb-6 leading-relaxed"
                data-testid={`faq-answer-${index}`}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Vous avez d'autres questions ?
          </p>
          <p className="text-sm text-muted-foreground">
            Contactez notre équipe à{" "}
            <a 
              href="mailto:support@cvbooster.fr" 
              className="text-primary hover:underline"
              data-testid="link-support-email"
            >
              support@cvbooster.fr
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}