import { CheckCircle2, FileText, Stars } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Téléverse ton CV",
      desc: "Importe ton CV actuel ou commence de zéro en quelques clics.",
      Icon: FileText,
    },
    {
      title: "Analyse IA instantanée",
      desc: "L'IA identifie les points forts et propose des améliorations ciblées.",
      Icon: Stars,
    },
    {
      title: "Obtiens un CV pro",
      desc: "Télécharge un CV optimisé et beau, prêt pour les recruteurs.",
      Icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/20" data-testid="section-how-it-works">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Comment ça marche</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un parcours simple et guidé pour transformer ton CV en quelques minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ title, desc, Icon }, idx) => (
            <div key={idx} className="group rounded-xl border bg-background/60 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm text-muted-foreground">Étape {idx + 1}</div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
