import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Assistant IA CVBooster</h1>
            <p className="text-muted-foreground">
              Pose tes questions et reçois des conseils personnalisés pour améliorer tes candidatures.
            </p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}