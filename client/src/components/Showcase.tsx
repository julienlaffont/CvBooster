import { Card } from "@/components/ui/card";
import img1 from "@assets/generated_images/Modern_professional_CV_template_74f056c7.png";
import img2 from "@assets/generated_images/Creative_professional_resume_design_17335a3d.png";
import img3 from "@assets/generated_images/Executive_professional_CV_template_693b9e63.png";

export function Showcase() {
  const items = [
    { src: img1, alt: "Exemple de CV moderne", caption: "CV Moderne" },
    { src: img2, alt: "Exemple de CV créatif", caption: "CV Créatif" },
    { src: img3, alt: "Exemple de CV exécutif", caption: "CV Exécutif" },
  ];

  return (
    <section className="py-20 px-4" data-testid="section-showcase">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Galerie de Résultats</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des CV beaux, lisibles, adaptés aux recruteurs. Visualise le rendu final que tu peux obtenir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((it, idx) => (
            <Card key={idx} className="group overflow-hidden hover-elevate">
              <div className="aspect-[3/4] bg-white">
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-muted-foreground">{it.caption}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


