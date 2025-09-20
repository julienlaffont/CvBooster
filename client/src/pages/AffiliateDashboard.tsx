import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { 
  Copy, 
  TrendingUp, 
  Euro, 
  Users, 
  MousePointer, 
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Link2
} from "lucide-react";

interface AffiliateStats {
  affiliate: {
    id: string;
    affiliateCode: string;
    commissionRate: number;
    status: string;
    affiliateLink: string;
  };
  stats: {
    totalClicks: number;
    totalReferrals: number;
    paidReferrals: number;
    conversionRate: number;
    pendingCommissions: number;
    validatedCommissions: number;
    paidCommissions: number;
    totalEarnings: number;
  };
  recentReferrals: Array<{
    id: string;
    subscriptionPlan: string;
    subscriptionAmount: number;
    commissionAmount: number;
    status: string;
    referredAt: string;
  }>;
}

const AffiliateDashboard = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [customLink, setCustomLink] = useState("");

  // Fetch affiliate dashboard data
  const { data: affiliateData, isLoading, error, refetch } = useQuery<AffiliateStats>({
    queryKey: ['/api/affiliate/dashboard'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien a été copié dans le presse-papier.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const generateCustomLink = (path: string = "") => {
    if (!affiliateData?.affiliate.affiliateCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}?ref=${affiliateData.affiliate.affiliateCode}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'validated':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Validé</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-blue-600"><DollarSign className="w-3 h-3 mr-1" />Payé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour accéder au tableau de bord d'affiliation.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !affiliateData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? "Erreur lors du chargement des données" : "Vous n'êtes pas encore membre du programme d'affiliation"}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.location.href = '/affiliate'} data-testid="button-join-program">
              Rejoindre le programme
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { affiliate, stats, recentReferrals } = affiliateData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="title-dashboard">
                Tableau de bord affilié
              </h1>
              <p className="text-muted-foreground">
                Bienvenue {(user as any)?.firstName || (user as any)?.email || 'Affilié'}, voici vos statistiques d'affiliation
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1" data-testid="badge-affiliate-code">
              Code: {affiliate.affiliateCode}
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-clicks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics totaux</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                Visiteurs via vos liens
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-conversions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% taux de conversion
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-earnings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gains totaux</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarnings}€</div>
              <p className="text-xs text-muted-foreground">
                {stats.validatedCommissions}€ validées
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-pending">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCommissions}€</div>
              <p className="text-xs text-muted-foreground">
                À valider
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList>
            <TabsTrigger value="links">Liens d'affiliation</TabsTrigger>
            <TabsTrigger value="referrals">Parrainages récents</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card data-testid="card-affiliate-links">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Vos liens d'affiliation
                </CardTitle>
                <CardDescription>
                  Utilisez ces liens pour promouvoir CVBooster et gagner des commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main affiliate link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lien principal</label>
                  <div className="flex gap-2">
                    <Input 
                      value={affiliate.affiliateLink}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="input-main-link"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(affiliate.affiliateLink)}
                      data-testid="button-copy-main"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Custom links */}
                <div className="space-y-4">
                  <h4 className="font-medium">Liens personnalisés</h4>
                  
                  {[
                    { path: "/pricing", name: "Page tarifs" },
                    { path: "/wizard", name: "Générateur CV" },
                    { path: "/cover-letter", name: "Lettre de motivation" },
                    { path: "/chat", name: "Coach IA" }
                  ].map((linkType) => (
                    <div key={linkType.path} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">{linkType.name}</div>
                        <div className="flex gap-2">
                          <Input 
                            value={generateCustomLink(linkType.path)}
                            readOnly
                            className="font-mono text-xs"
                            data-testid={`input-custom-${linkType.path.replace('/', '')}`}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(generateCustomLink(linkType.path))}
                            data-testid={`button-copy-${linkType.path.replace('/', '')}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(generateCustomLink(linkType.path), '_blank')}
                            data-testid={`button-preview-${linkType.path.replace('/', '')}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Astuce :</strong> Utilisez les liens personnalisés pour diriger vos contacts vers des pages spécifiques.
                    Tous les liens suivent automatiquement vos conversions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card data-testid="card-recent-referrals">
              <CardHeader>
                <CardTitle>Parrainages récents</CardTitle>
                <CardDescription>
                  Vos dernières conversions et leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentReferrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun parrainage pour le moment</p>
                    <p className="text-sm">Partagez vos liens pour commencer à gagner !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReferrals.map((referral, index) => (
                      <div 
                        key={referral.id} 
                        className="border rounded-lg p-4 space-y-2"
                        data-testid={`referral-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              {referral.subscriptionPlan}
                            </Badge>
                            {getStatusBadge(referral.status)}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{referral.commissionAmount}€</div>
                            <div className="text-sm text-muted-foreground">
                              sur {referral.subscriptionAmount}€
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(referral.referredAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card data-testid="card-performance">
              <CardHeader>
                <CardTitle>Analyse des performances</CardTitle>
                <CardDescription>
                  Analysez l'efficacité de vos campagnes d'affiliation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de conversion</span>
                      <span className="font-medium">{stats.conversionRate}%</span>
                    </div>
                    <Progress value={stats.conversionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {stats.totalClicks}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Clics générés
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {stats.totalReferrals}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Conversions
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Commission par plan</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">4€</div>
                        <div className="text-sm text-muted-foreground">Plan Pro (20€)</div>
                        <div className="text-xs text-muted-foreground">20% commission</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">10€</div>
                        <div className="text-sm text-muted-foreground">Plan Expert (50€)</div>
                        <div className="text-xs text-muted-foreground">20% commission</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AffiliateDashboard;