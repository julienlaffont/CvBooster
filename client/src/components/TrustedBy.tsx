export function TrustedBy() {
  const companies = [
    { name: "LinkedIn", logo: "Li" },
    { name: "Indeed", logo: "In" },
    { name: "Monster", logo: "Mo" },
    { name: "Glassdoor", logo: "Gl" },
    { name: "StepStone", logo: "St" },
    { name: "Welcome to the Jungle", logo: "Wt" }
  ];

  return (
    <section className="py-12 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground font-medium tracking-wider uppercase">
            Ils nous font confiance
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[100px] h-12 grayscale hover:grayscale-0 transition-all duration-300"
              data-testid={`trusted-company-${company.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted-foreground/10 rounded-md flex items-center justify-center border border-muted-foreground/20">
                  <span className="text-xs font-bold text-muted-foreground">
                    {company.logo}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/80">
            Utilisé par des milliers de candidats pour décrocher leur emploi de rêve
          </p>
        </div>
      </div>
    </section>
  );
}