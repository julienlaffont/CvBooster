import { 
  SiLinkedin, 
  SiIndeed, 
  SiGlassdoor
} from "react-icons/si";
import { Building2, Users, Search } from "lucide-react";

export function TrustedBy() {
  const companies = [
    { name: "LinkedIn", icon: SiLinkedin, color: "text-[#0A66C2]" },
    { name: "Indeed", icon: SiIndeed, color: "text-[#2557A7]" },
    { name: "Monster", icon: Building2, color: "text-[#6A4BC2]" },
    { name: "Glassdoor", icon: SiGlassdoor, color: "text-[#0CAA41]" },
    { name: "StepStone", icon: Users, color: "text-[#FF6B35]" },
    { name: "Welcome to the Jungle", icon: Search, color: "text-[#FF6B9D]" }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Ils nous font confiance
          </h3>
          <p className="text-sm text-muted-foreground">
            Rejoint des milliers de professionnels qui ont transformé leur carrière
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[120px] h-16 p-4 rounded-lg bg-background/50 border border-border/50 hover:border-border hover:bg-background hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              data-testid={`trusted-company-${company.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <company.icon className={`w-6 h-6 ${company.color} hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>+50,000 CVs créés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>95% de satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Taux d'embauche +40%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}