import { Header } from "@/components/Header";
import { CoverLetterGenerator } from "@/components/CoverLetterGenerator";

export default function CoverLetterGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CoverLetterGenerator />
      </main>
    </div>
  );
}