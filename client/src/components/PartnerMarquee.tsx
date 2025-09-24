import { SiLinkedin, SiIndeed, SiGlassdoor, SiGithub, SiGoogle } from "react-icons/si";

type PartnerItem = {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
};

const partners: PartnerItem[] = [
  { name: "LinkedIn", Icon: SiLinkedin, colorClass: "text-[#0A66C2]" },
  { name: "Indeed", Icon: SiIndeed, colorClass: "text-[#2557A7]" },
  { name: "Glassdoor", Icon: SiGlassdoor, colorClass: "text-[#0CAA41]" },
  { name: "GitHub", Icon: SiGithub, colorClass: "text-[#24292e] dark:text-white" },
  { name: "Google", Icon: SiGoogle, colorClass: "text-[#4285F4]" },
  { name: "Microsoft", Icon: SiGoogle, colorClass: "text-[#5E5E5E]" },
];

export function PartnerMarquee() {
  // duplicate list for seamless loop
  const items = [...partners, ...partners];

  return (
    <section className="py-10 px-4 bg-background" aria-label="Partenaires et plateformes">
      <div className="container mx-auto max-w-6xl">
        <div className="relative overflow-hidden">
          <div
            className="flex gap-8 md:gap-12 animate-[marquee_25s_linear_infinite] will-change-transform"
            aria-hidden="true"
          >
            {items.map((p, i) => (
              <div key={i} className="shrink-0 flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                <p.Icon className={`h-6 w-6 ${p.colorClass ?? "text-foreground"}`} />
                <span className="text-sm text-muted-foreground hidden sm:inline">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        `}
      </style>
    </section>
  );
}


