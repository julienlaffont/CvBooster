import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import DashboardPage from "@/pages/DashboardPage";
import ChatPage from "@/pages/ChatPage";
import PhotoEnhancementPage from "@/pages/PhotoEnhancementPage";
import CVWizardPage from "@/pages/CVWizardPage";
import CoverLetterGeneratorPage from "@/pages/CoverLetterGeneratorPage";
import Subscribe from "@/pages/Subscribe";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import PricingPage from "@/pages/PricingPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import AffiliatePage from "@/pages/AffiliatePage";
import AffiliateDashboard from "@/pages/AffiliateDashboard";
import NotFound from "@/pages/not-found";

// Feature pages
import AnalyseIAPage from "@/pages/features/AnalyseIAPage";
import LettrePersonnaliseePage from "@/pages/features/LettrePersonnaliseePage";
import PhotoIAPage from "@/pages/features/PhotoIAPage";
import ContextingIAPage from "@/pages/features/ContextingIAPage";
import ExportProfessionnelPage from "@/pages/features/ExportProfessionnelPage";
import MultisecteurPage from "@/pages/features/MultisecteurPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a simple loading page while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={isAuthenticated ? DashboardPage : Home} />
      
      {/* Feature pages - accessible to all users */}
      <Route path="/features/analyse-ia" component={AnalyseIAPage} />
      <Route path="/features/lettre-personnalisee" component={LettrePersonnaliseePage} />
      <Route path="/features/photo-ia" component={PhotoIAPage} />
      <Route path="/features/contexting-ia" component={ContextingIAPage} />
      <Route path="/features/export-professionnel" component={ExportProfessionnelPage} />
      <Route path="/features/multisecteur" component={MultisecteurPage} />
      
      {/* Routes accessible to all users */}
      <Route path="/pricing" component={PricingPage} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/wizard" component={CVWizardPage} />
      <Route path="/cv-wizard" component={CVWizardPage} />
      <Route path="/cvs/:id/edit" component={CVWizardPage} />
      <Route path="/cover-letter" component={CoverLetterGeneratorPage} />
      <Route path="/cover-letters/:id/edit" component={CoverLetterGeneratorPage} />
      <Route path="/photo" component={PhotoEnhancementPage} />
      <Route path="/chat" component={ChatPage} />
      
      {/* Authentication routes */}
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      
      {/* Subscription routes */}
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      
      {/* Protected routes for authenticated users only */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/affiliate/dashboard" component={AffiliateDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
