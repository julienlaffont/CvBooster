import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Plus, 
  Upload, 
  Eye, 
  Edit, 
  Download, 
  MessageSquare,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";

// TODO: Remove mock data - replace with real user data from API
const mockDocuments = [
  {
    id: "1",
    title: "CV Développeur Frontend",
    type: "CV",
    status: "Optimisé",
    lastModified: "Il y a 2 heures",
    score: 95,
    suggestions: 2
  },
  {
    id: "2", 
    title: "Lettre - Google",
    type: "Lettre",
    status: "En cours",
    lastModified: "Il y a 1 jour",
    score: 78,
    suggestions: 5
  },
  {
    id: "3",
    title: "CV Marketing Digital",
    type: "CV",
    status: "Brouillon",
    lastModified: "Il y a 3 jours",
    score: 65,
    suggestions: 8
  }
];

const recentActivity = [
  "IA a analysé ton CV Développeur Frontend",
  "Nouvelle suggestion pour la section Compétences",
  "Export PDF généré avec succès",
  "Lettre de motivation Google mise à jour"
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("documents");

  const handleDocumentAction = (action: string, docId: string) => {
    console.log(`${action} action on document ${docId}`);
  };

  const handleNewDocument = (type: string) => {
    console.log(`Creating new ${type}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Optimisé": return "text-green-500";
      case "En cours": return "text-yellow-500";
      case "Brouillon": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-welcome">
                  Salut Jean ! 👋
                </h1>
                <p className="text-muted-foreground">
                  Prêt à booster tes candidatures aujourd'hui ?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleNewDocument("CV")}
                data-testid="button-new-cv"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau CV
              </Button>
              <Button 
                size="sm"
                onClick={() => handleNewDocument("Lettre")}
                data-testid="button-new-letter"
              >
                <FileText className="h-4 w-4 mr-2" />
                Nouvelle Lettre
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card data-testid="card-stat-documents">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Documents</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-score">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score Moyen</p>
                      <p className="text-2xl font-bold text-yellow-500">79</p>
                    </div>
                    <Star className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-stat-suggestions">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Suggestions</p>
                      <p className="text-2xl font-bold text-blue-500">15</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Mes Documents
                  <Button variant="ghost" size="sm" data-testid="button-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDocuments.map((doc, index) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate transition-all"
                    data-testid={`row-document-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold" data-testid={`text-title-${index}`}>
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          <span className={getStatusColor(doc.status)}>
                            {doc.status}
                          </span>
                          <span>{doc.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`font-semibold ${getScoreColor(doc.score)}`}>
                          {doc.score}/100
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.suggestions} suggestions
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDocumentAction("view", doc.id)}
                          data-testid={`button-view-${index}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDocumentAction("edit", doc.id)}
                          data-testid={`button-edit-${index}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDocumentAction("download", doc.id)}
                          data-testid={`button-download-${index}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {mockDocuments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun document pour le moment</p>
                    <p className="text-sm">Commence par créer ton premier CV !</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Coach */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Coach IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Besoin d'aide ? Ton assistant IA est là !
                </p>
                <Button className="w-full" size="sm" data-testid="button-chat-ai">
                  Démarrer une conversation
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground" data-testid={`text-activity-${index}`}>
                      {activity}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profil complété</span>
                    <span className="text-primary">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}