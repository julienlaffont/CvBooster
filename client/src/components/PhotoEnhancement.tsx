import { useState } from "react";
import { Upload, Camera, Sparkles, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUploadPhoto, useAnalyzePhoto, useEnhancePhoto, useApplyEnhancedPhoto, useUser } from "@/lib/api";

interface PhotoAnalysis {
  analysis: string;
  score: number;
  suggestions: string[];
}

interface PhotoEnhancement {
  enhancedImage: string;
  message: string;
  improvements: string[];
}

export default function PhotoEnhancement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [enhancement, setEnhancement] = useState<PhotoEnhancement | null>(null);
  
  const { data: user, refetch: refetchUser } = useUser();
  const uploadPhoto = useUploadPhoto();
  const analyzePhoto = useAnalyzePhoto();
  const enhancePhoto = useEnhancePhoto();
  const applyEnhancedPhoto = useApplyEnhancedPhoto();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setEnhancement(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      const result = await analyzePhoto.mutateAsync(selectedFile);
      setAnalysis(result);
      toast({
        title: "Analyse terminée",
        description: "Votre photo a été analysée avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'analyse",
        description: error.message || "Erreur lors de l'analyse de la photo.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadPhoto.mutateAsync(selectedFile);
      await refetchUser();
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Erreur lors de l'upload de la photo.",
        variant: "destructive",
      });
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;

    try {
      const result = await enhancePhoto.mutateAsync(selectedFile);
      setEnhancement(result);
      toast({
        title: "Photo améliorée",
        description: "Votre photo a été améliorée avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'amélioration",
        description: error.message || "Erreur lors de l'amélioration de la photo.",
        variant: "destructive",
      });
    }
  };

  const handleApplyEnhanced = async () => {
    if (!enhancement?.enhancedImage) return;

    try {
      await applyEnhancedPhoto.mutateAsync(enhancement.enhancedImage);
      await refetchUser();
      toast({
        title: "Photo appliquée",
        description: "La photo améliorée a été définie comme photo de profil.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'application",
        description: error.message || "Erreur lors de l'application de la photo améliorée.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Amélioration Photo IA
        </h1>
        <p className="text-muted-foreground">
          Optimisez votre photo de profil avec l'intelligence artificielle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo actuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Avatar className="h-32 w-32 mx-auto">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {user?.profileImageUrl ? (
              <p className="text-sm text-muted-foreground">
                Photo de profil actuelle
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune photo de profil
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upload et aperçu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Nouvelle photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cliquez pour uploader</p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP • Max 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-photo"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto h-32 w-32 rounded-full overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysis(null);
                      setEnhancement(null);
                    }}
                    data-testid="button-remove-photo"
                  >
                    Supprimer
                  </Button>
                  <label htmlFor="photo-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>Changer</span>
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {selectedFile && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={handleAnalyze}
            disabled={analyzePhoto.isPending}
            className="gap-2"
            variant="outline"
            data-testid="button-analyze-photo"
          >
            <Sparkles className="h-4 w-4" />
            {analyzePhoto.isPending ? "Analyse en cours..." : "Analyser avec l'IA"}
          </Button>
          <Button
            onClick={handleEnhance}
            disabled={enhancePhoto.isPending}
            className="gap-2"
            data-testid="button-enhance-photo"
          >
            <Sparkles className="h-4 w-4" />
            {enhancePhoto.isPending ? "Amélioration en cours..." : "Améliorer avec l'IA"}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadPhoto.isPending}
            variant="outline"
            className="gap-2"
            data-testid="button-upload-photo"
          >
            <CheckCircle className="h-4 w-4" />
            {uploadPhoto.isPending ? "Upload en cours..." : "Utiliser photo originale"}
          </Button>
        </div>
      )}

      {/* Photo Enhancement Results */}
      {enhancement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Photo améliorée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center space-y-3">
                <h4 className="font-medium">Photo originale</h4>
                <div className="mx-auto h-48 w-48 rounded-lg overflow-hidden bg-muted border">
                  <img
                    src={previewUrl || ''}
                    alt="Original"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h4 className="font-medium">Photo améliorée</h4>
                <div className="mx-auto h-48 w-48 rounded-lg overflow-hidden bg-muted border-2 border-primary">
                  <img
                    src={enhancement.enhancedImage}
                    alt="Améliorée"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Improvements List */}
            <div>
              <h4 className="font-semibold mb-3">Améliorations appliquées</h4>
              <div className="space-y-2">
                {enhancement.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Enhanced Photo */}
            <div className="text-center">
              <Button
                onClick={handleApplyEnhanced}
                disabled={applyEnhancedPhoto.isPending}
                size="lg"
                className="gap-2"
                data-testid="button-apply-enhanced"
              >
                <CheckCircle className="h-4 w-4" />
                {applyEnhancedPhoto.isPending ? "Application en cours..." : "Appliquer comme photo de profil"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats d'analyse */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Analyse IA de votre photo
              <Badge variant={getScoreBadgeVariant(analysis.score)} className="ml-auto">
                <Star className="h-3 w-3 mr-1" />
                {analysis.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score professionnel</span>
                <span className={`text-sm font-semibold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Analyse détaillée
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.analysis}
              </p>
            </div>

            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Suggestions d'amélioration</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm">{suggestion.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}