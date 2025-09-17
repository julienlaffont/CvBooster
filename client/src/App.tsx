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
import NotFound from "@/pages/not-found";

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
      
      {/* Routes accessible to all users */}
      <Route path="/wizard" component={CVWizardPage} />
      <Route path="/cover-letter" component={CoverLetterGeneratorPage} />
      <Route path="/photo" component={PhotoEnhancementPage} />
      
      {/* Protected routes for authenticated users only */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/chat" component={ChatPage} />
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
