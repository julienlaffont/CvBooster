import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustedBy } from "@/components/TrustedBy";
import { CVExamples } from "@/components/CVExamples";
import { Features } from "@/components/Features";
import { Showcase } from "@/components/Showcase";
import { HowItWorks } from "@/components/HowItWorks";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

export default function Home() {
  const { affiliateCode, isTracking, hasTracked, isAffiliateReferral } = useAffiliate();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Affiliate Tracking Notification */}
      {isAffiliateReferral() && hasTracked && (
        <div className="bg-primary/10 border-b border-primary/20 py-2">
          <div className="container mx-auto px-4">
            <Alert className="bg-transparent border-0 p-0">
              <Users className="h-4 w-4" />
              <AlertDescription className="ml-2 text-sm">
                Vous avez été parrainé ! Bénéficiez de nos services premium.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      
      {isTracking && (
        <div className="bg-muted/50 border-b py-2">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-muted-foreground">
              Tracking du parrainage en cours...
            </div>
          </div>
        </div>
      )}
      
      <main>
        <Hero />
        <TrustedBy />
        <Showcase />
        <HowItWorks />
        <PartnerMarquee />
        <CVExamples />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}