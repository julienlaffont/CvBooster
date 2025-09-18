import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProgressLoader } from "@/components/ui/progress-loader";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { Sparkles, Save, Download, ArrowRight, Loader2, Building, User, Briefcase, Plus } from "lucide-react";

const SECTORS = [
  "Informatique et Tech", "Finance et Banque", "Marketing et Communication", 
  "Ressources Humaines", "Santé", "Éducation", "Ingénierie", "Commerce et Vente",
  "Logistique", "Conseil", "Industrie", "Autre"
];

export function CoverLetterGenerator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    sector: "",
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    },
    experience: [
      { position: "", company: "", duration: "", description: "" }
    ],
    motivations: ""
  });
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { showUpgradeModal } = useUpgradeModal();

  const generateLetter = useMutation({
    mutationFn: async (data: any) => {
      setIsGenerating(true);
      try {
        const response = await fetch('/api/cover-letters/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });

        if (!response.ok) {
          // Handle free limit exceeded specifically before throwing
          if (response.status === 403) {
            try {
              const errorData = await response.json();
              if (errorData.code === 'free_limit_exceeded') {
                // Throw a special error that we can catch in onError
                const specialError = new Error(errorData.error);
                (specialError as any).isFreeLimit = true;
                throw specialError;
              }
            } catch (parseError) {
              // If JSON parsing fails, continue with normal error handling
            }
          }
          
          // For other errors, use standard error handling
          let errorMessage = response.statusText;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Use default error message
          }
          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (error) {
        setIsGenerating(false);
        throw error;
      }
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setStep(4);
      setIsGenerating(false);
      toast({
        title: "✨ Lettre générée !",
        description: "Votre lettre de motivation personnalisée est prête"
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      // Réinitialiser la mutation pour s'assurer qu'isPending revient à false
      setTimeout(() => {
        generateLetter.reset();
      }, 100);
      
      // Handle free limit exceeded specifically
      if (error.isFreeLimit) {
        showUpgradeModal();
        return; // Don't show toast error for upgrade modal
      }
      
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer la lettre",
        variant: "destructive"
      });
    },
    onSettled: () => {
      // S'assurer que l'état isPending est correctement remis à false
      setIsGenerating(false);
    }
  });

  const saveLetter = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/cover-letters', {
        title: `Lettre - ${formData.companyName} - ${formData.position}`,
        content,
        companyName: formData.companyName,
        position: formData.position,
        sector: formData.sector
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lettre sauvegardée",
        description: "Votre lettre a été ajoutée à vos documents"
      });
    }
  });

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { position: "", company: "", duration: "", description: "" }]
    });
  };

  const removeExperience = (index: number) => {
    const newExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExperience });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const handleGenerate = () => {
    if (!formData.companyName || !formData.position) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner l'entreprise et le poste",
        variant: "destructive"
      });
      return;
    }
    generateLetter.mutate(formData);
  };

  const handleSave = () => {
    saveLetter.mutate(generatedContent);
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <CardTitle>Entreprise et Poste</CardTitle>
        </div>
        <CardDescription>
          Informations sur l'entreprise et le poste visé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Ex: Dassault Systèmes"
            data-testid="input-company-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Poste visé *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Ex: Ingénieur Logiciel Senior"
            data-testid="input-position"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d'activité</Label>
          <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
            <SelectTrigger data-testid="select-sector">
              <SelectValue placeholder="Sélectionnez un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Informations personnelles</CardTitle>
        </div>
        <CardDescription>
          Vos coordonnées qui apparaîtront dans la lettre
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={formData.personalInfo.firstName}
              onChange={(e) => setFormData({ 
                ...formData, 
                personalInfo: { ...formData.personalInfo, firstName: e.target.value }
              })}
              placeholder="Jean"
              data-testid="input-first-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={formData.personalInfo.lastName}
              onChange={(e) => setFormData({ 
                ...formData, 
                personalInfo: { ...formData.personalInfo, lastName: e.target.value }
              })}
              placeholder="Dupont"
              data-testid="input-last-name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => setFormData({ 
              ...formData, 
              personalInfo: { ...formData.personalInfo, email: e.target.value }
            })}
            placeholder="jean.dupont@email.com"
            data-testid="input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.personalInfo.phone}
            onChange={(e) => setFormData({ 
              ...formData, 
              personalInfo: { ...formData.personalInfo, phone: e.target.value }
            })}
            placeholder="06 12 34 56 78"
            data-testid="input-phone"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle>Expérience et motivations</CardTitle>
        </div>
        <CardDescription>
          Expériences pertinentes et motivations pour ce poste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Expériences pertinentes</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExperience}
              data-testid="button-add-experience"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          
          {formData.experience.map((exp, index) => (
            <Card key={index} className="border-dashed">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Expérience {index + 1}</h4>
                    {formData.experience.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Poste occupé"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      data-testid={`input-experience-position-${index}`}
                    />
                    <Input
                      placeholder="Entreprise"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      data-testid={`input-experience-company-${index}`}
                    />
                  </div>
                  <Input
                    placeholder="Durée (ex: 2020-2023)"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    data-testid={`input-experience-duration-${index}`}
                  />
                  <Textarea
                    placeholder="Brève description des missions et réalisations"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={2}
                    data-testid={`textarea-experience-description-${index}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="motivations">Motivations pour ce poste</Label>
          <Textarea
            id="motivations"
            value={formData.motivations}
            onChange={(e) => setFormData({ ...formData, motivations: e.target.value })}
            placeholder="Expliquez pourquoi ce poste vous intéresse et ce que vous pourriez apporter à l'entreprise..."
            rows={4}
            data-testid="textarea-motivations"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Lettre générée</CardTitle>
        </div>
        <CardDescription>
          Votre lettre de motivation personnalisée est prête
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
            {generatedContent}
          </pre>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saveLetter.isPending}
            data-testid="button-save-letter"
          >
            {saveLetter.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
          <Button variant="outline" data-testid="button-download-letter">
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Génération de Lettre de Motivation IA</h1>
        <p className="text-muted-foreground">
          Créez une lettre personnalisée et convaincante en quelques minutes
        </p>
        
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {/* AI Generation Progress */}
      {(generateLetter.isPending || isGenerating) && (
        <ProgressLoader 
          text="L'IA rédige votre lettre de motivation personnalisée..." 
          size="md"
          variant="default"
        />
      )}

      {/* Navigation */}
      {!(generateLetter.isPending || isGenerating) && (
        <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || generateLetter.isPending || isGenerating}
          data-testid="button-previous"
        >
          Précédent
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            data-testid="button-next"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : step === 3 ? (
          <Button
            onClick={handleGenerate}
            disabled={generateLetter.isPending || isGenerating}
            data-testid="button-generate-letter"
          >
            {(generateLetter.isPending || isGenerating) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Générer la lettre
          </Button>
        ) : (
          <Button
            onClick={() => {
              setStep(1);
              setGeneratedContent("");
              setIsGenerating(false);
              generateLetter.reset();
              setFormData({
                companyName: "",
                position: "",
                sector: "",
                personalInfo: { firstName: "", lastName: "", email: "", phone: "" },
                experience: [{ position: "", company: "", duration: "", description: "" }],
                motivations: ""
              });
            }}
            variant="outline"
            data-testid="button-new-letter"
          >
            Nouvelle lettre
          </Button>
        )}
        </div>
      )}
    </div>
  );
}