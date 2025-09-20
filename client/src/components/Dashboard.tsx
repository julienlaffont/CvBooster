import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
  CheckCircle,
  Loader2
} from "lucide-react";
import { 
  useUser,
  useDashboardStats,
  useCvs,
  useCoverLetters,
  useUploadCv,
  useUploadCoverLetter,
  useAnalyzeCv,
  useAnalyzeCoverLetter,
  useDeleteCv,
  useDeleteCoverLetter
} from "@/lib/api";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner, PlanStatusIndicator } from "@/components/SubscriptionBanner";
import { UpgradeModal } from "@/components/UpgradeModal";

// Helper function to format dates
function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `Il y a ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
}

// Helper function to get status in French
function getStatusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'optimized': return 'Optimisé';
    case 'analyzed': return 'Analysé';
    default: return 'En cours';
  }
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'cv' | 'cover-letter' | 'feature'>('feature');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // API calls
  const { data: user } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: cvs = [], isLoading: cvsLoading } = useCvs();
  const { data: coverLetters = [], isLoading: lettersLoading } = useCoverLetters();
  
  // Subscription management
  const {
    canGenerateCV,
    canGenerateCoverLetter,
    remainingCVGenerations,
    remainingCoverLetterGenerations,
    hasCoaching,
    hasAdvancedAnalytics,
    isPremiumUser
  } = useSubscription();
  
  // Mutations
  const uploadCv = useUploadCv();
  const uploadCoverLetter = useUploadCoverLetter();
  const analyzeCv = useAnalyzeCv();
  const analyzeCoverLetter = useAnalyzeCoverLetter();
  const deleteCv = useDeleteCv();
  const deleteCoverLetter = useDeleteCoverLetter();

  const handleDocumentAction = async (action: string, docId: string, docType: 'CV' | 'Lettre') => {
    try {
      switch (action) {
        case 'analyze':
          if (docType === 'CV') {
            await analyzeCv.mutateAsync(docId);
            toast({ title: "Analyse terminée", description: "Votre CV a été analysé avec succès" });
          } else {
            await analyzeCoverLetter.mutateAsync(docId);
            toast({ title: "Analyse terminée", description: "Votre lettre a été analysée avec succès" });
          }
          break;
        case 'delete':
          if (docType === 'CV') {
            await deleteCv.mutateAsync(docId);
            toast({ title: "CV supprimé", description: "Le CV a été supprimé avec succès" });
          } else {
            await deleteCoverLetter.mutateAsync(docId);
            toast({ title: "Lettre supprimée", description: "La lettre a été supprimée avec succès" });
          }
          break;
        case 'edit':
          if (docType === 'CV') {
            navigate(`/cvs/${docId}/edit`);
          } else {
            navigate(`/cover-letters/${docId}/edit`);
          }
          break;
        case 'view':
        case 'download':
          // TODO: Implement these actions
          toast({ title: "À venir", description: `Fonction ${action} en cours de développement` });
          break;
      }
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message || "Une erreur est survenue", 
        variant: "destructive" 
      });
    }
  };

  const handleNewDocument = (type: string) => {
    // Check subscription limits before creating new documents
    if (type === "CV") {
      if (!canGenerateCV) {
        setUpgradeModalType('cv');
        setShowUpgradeModal(true);
        return;
      }
    } else if (type === "Lettre") {
      if (!canGenerateCoverLetter) {
        setUpgradeModalType('cover-letter');
        setShowUpgradeModal(true);
        return;
      }
    }
    
    // TODO: Implement document creation
    toast({ title: "À venir", description: `Création de ${type} en cours de développement` });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      // Detect document type based on filename or let user choose
      const isCv = file.name.toLowerCase().includes('cv') || file.name.toLowerCase().includes('resume');
      
      if (isCv) {
        await uploadCv.mutateAsync({ file });
        toast({ title: "Success", description: "CV uploadé avec succès" });
      } else {
        await uploadCoverLetter.mutateAsync({ file });
        toast({ title: "Success", description: "Lettre uploadée avec succès" });
      }
    } catch (error: any) {
      toast({ 
        title: "Erreur d'upload", 
        description: error.message || "Erreur lors de l'upload du fichier", 
        variant: "destructive" 
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const getStatusColor = (status: string) => {
    const frenchStatus = getStatusLabel(status);
    switch (frenchStatus) {
      case "Optimisé": return "text-green-500";
      case "Analysé": return "text-blue-500";
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

  // Combine CVs and cover letters for display
  const allDocuments = [
    ...cvs.map(cv => ({
      id: cv.id,
      title: cv.title,
      type: 'CV',
      status: cv.status || 'draft',
      lastModified: formatDate(cv.updatedAt || cv.createdAt || new Date()),
      score: cv.score || 0,
      suggestions: Array.isArray(cv.suggestions) ? cv.suggestions.length : 0
    })),
    ...coverLetters.map(letter => ({
      id: letter.id,
      title: letter.title,
      type: 'Lettre',
      status: letter.status || 'draft',
      lastModified: formatDate(letter.updatedAt || letter.createdAt || new Date()),
      score: letter.score || 0,
      suggestions: Array.isArray(letter.suggestions) ? letter.suggestions.length : 0
    }))
  ];

  const isLoading = statsLoading || cvsLoading || lettersLoading;

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
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-welcome">
                  Salut {user?.name || 'Utilisateur'} ! 👋
                </h1>
                <p className="text-muted-foreground">
                  Prêt à booster tes candidatures aujourd'hui ?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PlanStatusIndicator />
              <Button 
                variant="outline" 
                onClick={() => handleNewDocument("CV")}
                data-testid="button-new-cv"
                disabled={!canGenerateCV && !isPremiumUser}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau CV
                {!isPremiumUser && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {remainingCVGenerations}/3
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={() => handleNewDocument("Lettre")}
                data-testid="button-new-letter"
                disabled={!canGenerateCoverLetter && !isPremiumUser}
              >
                <FileText className="h-4 w-4 mr-2" />
                Nouvelle Lettre
                {!isPremiumUser && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {remainingCoverLetterGenerations}/3
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subscription Banner */}
        <SubscriptionBanner />
        
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
                      <p className="text-2xl font-bold">
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.documents || 0}
                      </p>
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
                      <p className={`text-2xl font-bold ${getScoreColor(stats?.averageScore || 0)}`}>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.averageScore || 0}
                      </p>
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
                      <p className="text-2xl font-bold text-blue-500">
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalSuggestions || 0}
                      </p>
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
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-upload"
                      disabled={uploadingFile}
                    />
                    <Button 
                      variant="ghost" 
                      data-testid="button-upload"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Importer
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-muted-foreground">Chargement des documents...</span>
                  </div>
                )}
                {!isLoading && allDocuments.map((doc, index) => (
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
                            {getStatusLabel(doc.status)}
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
                          size="icon"
                          onClick={() => handleDocumentAction("analyze", doc.id, doc.type as 'CV' | 'Lettre')}
                          disabled={analyzeCv.isPending || analyzeCoverLetter.isPending}
                          data-testid={`button-analyze-${index}`}
                          aria-label="Analyser"
                        >
                          {(analyzeCv.isPending || analyzeCoverLetter.isPending) ? 
                            <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("view", doc.id, doc.type as 'CV' | 'Lettre')}
                          data-testid={`button-view-${index}`}
                          aria-label="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("edit", doc.id, doc.type as 'CV' | 'Lettre')}
                          data-testid={`button-edit-${index}`}
                          aria-label="Éditer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDocumentAction("download", doc.id, doc.type as 'CV' | 'Lettre')}
                          data-testid={`button-download-${index}`}
                          aria-label="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!isLoading && allDocuments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun document pour le moment</p>
                    <p className="text-sm">Commence par créer ton premier CV ou importer un fichier !</p>
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
                <Button className="w-full" data-testid="button-chat-ai">
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
                {/* Recent activity based on real data */}
                {allDocuments.slice(0, 4).map((doc, index) => (
                  <div key={doc.id} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground" data-testid={`text-activity-${index}`}>
                      {doc.type} "{doc.title}" mis à jour {doc.lastModified}
                    </span>
                  </div>
                ))}
                {allDocuments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                )}
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
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        type={upgradeModalType}
      />
    </div>
  );
}