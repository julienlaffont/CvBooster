import { Header } from "@/components/Header";
import CVWizard from "@/components/CVWizard";

export default function CVWizardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CVWizard />
      </main>
    </div>
  );
}