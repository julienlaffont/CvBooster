import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { 
  useConversations,
  useCreateConversation,
  useConversationMessages,
  useSendMessage
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "Inconnue";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
  return date.toLocaleDateString('fr-FR');
};

export function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [demoMessages, setDemoMessages] = useState<Message[]>([]);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const { data: conversations = [] } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(
    currentConversationId || ""
  );
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const messageContent = inputValue;
    setInputValue("");
    
    if (!isAuthenticated) {
      // Demo mode for non-authenticated users
      const userMessage: Message = {
        id: `demo-user-${Date.now()}`,
        content: messageContent,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      setDemoMessages(prev => [...prev, userMessage]);
      setIsDemoLoading(true);
      
      try {
        const response = await fetch('/api/chat/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageContent })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la communication avec l\'IA');
        }
        
        const data = await response.json();
        
        const aiMessage: Message = {
          id: `demo-ai-${Date.now()}`,
          content: data.response,
          role: 'assistant',
          createdAt: new Date().toISOString()
        };
        
        setDemoMessages(prev => [...prev, aiMessage]);
        
        if (data.isDemo && data.isMock) {
          toast({
            title: "Mode démonstration",
            description: "Réponse de démonstration. Connectez-vous pour un coaching personnalisé."
          });
        }
        
      } catch (error: any) {
        console.error('Error in demo chat:', error);
        toast({
          title: "Erreur de démonstration",
          description: "Impossible de communiquer avec l'IA. Réessayez dans un moment.",
          variant: "destructive"
        });
      } finally {
        setIsDemoLoading(false);
      }
      
      return;
    }

    try {
      let conversationId = currentConversationId;
      
      // Create conversation if none exists
      if (!conversationId) {
        const newConversation = await createConversation.mutateAsync({
          title: "Conversation avec l'IA"
        });
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }

      // messageContent already defined above

      // Send message to API
      await sendMessage.mutateAsync({
        conversationId: conversationId!,
        content: messageContent
      });
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Extract error message from server response (like in other components)
      let errorMessage = "Impossible d'envoyer le message. Réessaie dans un moment.";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de conversation",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Initialize conversation if user is authenticated and no active conversation
  useEffect(() => {
    if (isAuthenticated && conversations.length > 0 && !currentConversationId) {
      // Use most recent conversation
      setCurrentConversationId(conversations[0].id);
    }
  }, [isAuthenticated, conversations, currentConversationId]);
  
  const isLoading = sendMessage.isPending || createConversation.isPending || isDemoLoading;
  
  // Get appropriate messages based on authentication status
  const currentMessages = isAuthenticated ? messages : demoMessages;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Assistant IA CVBooster</h3>
              <Badge variant="secondary" className="text-xs">
                En ligne
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bot className="h-16 w-16 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Bonjour !</h3>
              <p className="text-muted-foreground mb-4">
                Je suis ton assistant IA CVBooster. Pose-moi tes questions sur ton CV, tes lettres de motivation ou ta recherche d'emploi !
              </p>
              {!isAuthenticated && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Mode démonstration actif. <a href="/api/login" className="underline font-medium">Connectez-vous</a> pour un coaching personnalisé.
                  </p>
                </div>
              )}
            </div>
          ) : (
            currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.role}-${message.id}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  L'IA réfléchit...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAuthenticated ? "Pose ta question à l'IA..." : "Testez l'IA en mode démo..."}
              disabled={isLoading}
              data-testid="input-chat-message"
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Appuie sur Entrée pour envoyer • L'IA peut faire des erreurs
            {!isAuthenticated && " • Mode démonstration"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}