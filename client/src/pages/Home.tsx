import { Hero } from "@/components/Hero";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

export default function Home() {
  const { affiliateCode, isTracking, hasTracked, isAffiliateReferral } = useAffiliate();

  return (
    <div className="min-h-screen">
      {/* Affiliate Tracking Notification */}
      {isAffiliateReferral() && hasTracked && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-500/10 border-b border-blue-500/20 py-2">
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
        <div className="absolute top-0 left-0 right-0 z-50 bg-white/50 border-b py-2">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-gray-600">
              Tracking du parrainage en cours...
            </div>
          </div>
        </div>
      )}
      
      <main>
        <Hero />
      </main>
    </div>
  );
}