import { useState } from "react";
import { ArrowLeft, ArrowRight, User, Briefcase, GraduationCap, Wrench, Award, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCreateCv } from "@/lib/api";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  linkedIn: string;
  summary: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface CVWizardData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  certifications: string[];
  sector: string;
  targetPosition: string;
}

const SECTORS = [
  "Informatique / Technologies",
  "Finance / Banque",
  "Marketing / Communication",
  "Ressources Humaines",
  "Santé / Médical", 
  "Éducation / Formation",
  "Ingénierie",
  "Commerce / Vente",
  "Juridique",
  "Autre"
];

export default function CVWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [cvData, setCvData] = useState<CVWizardData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      linkedIn: "",
      summary: ""
    },
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    sector: "",
    targetPosition: ""
  });

  const createCv = useCreateCv();
  const { toast } = useToast();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: Date.now().toString(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false
      }]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !cvData.skills.includes(skill)) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const generateCV = async () => {
    setIsGenerating(true);
    try {
      // Format data for AI generation
      const formattedData = {
        personalInfo: cvData.personalInfo,
        experiences: cvData.experiences,
        education: cvData.education,
        skills: cvData.skills,
        languages: cvData.languages,
        certifications: cvData.certifications,
        sector: cvData.sector,
        targetPosition: cvData.targetPosition
      };

      const response = await fetch('/api/cvs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        // Extract error message from server response
        let errorMessage = 'Erreur lors de la génération du CV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setGeneratedCV(result.content);
      setCurrentStep(totalSteps + 1); // Move to review step
      
      toast({
        title: "CV généré avec succès",
        description: "Votre CV professionnel a été créé par l'IA",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer le CV",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCv = async () => {
    if (!generatedCV) return;

    try {
      const cvTitle = `CV - ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName} - ${cvData.targetPosition}`;
      
      await createCv.mutateAsync({
        title: cvTitle,
        content: generatedCV,
        sector: cvData.sector,
        position: cvData.targetPosition,
        status: 'draft'
      });

      toast({
        title: "CV sauvegardé",
        description: "Votre CV a été ajouté à vos documents",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le CV",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={cvData.personalInfo.firstName}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                    }))}
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={cvData.personalInfo.lastName}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                    }))}
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.personalInfo.email}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={cvData.personalInfo.phone}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={cvData.personalInfo.address}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                  data-testid="input-address"
                />
              </div>
              <div>
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  placeholder="https://linkedin.com/in/votre-profil"
                  value={cvData.personalInfo.linkedIn}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedIn: e.target.value }
                  }))}
                  data-testid="input-linkedIn"
                />
              </div>
              <div>
                <Label htmlFor="summary">Résumé professionnel</Label>
                <Textarea
                  id="summary"
                  placeholder="Décrivez brièvement votre profil et vos objectifs professionnels..."
                  value={cvData.personalInfo.summary}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, summary: e.target.value }
                  }))}
                  data-testid="textarea-summary"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Expérience professionnelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Ajoutez vos expériences professionnelles (la plus récente en premier)
                </p>
                <Button onClick={addExperience} size="sm" data-testid="button-add-experience">
                  Ajouter une expérience
                </Button>
              </div>
              
              {cvData.experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Expérience {index + 1}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeExperience(exp.id)}
                      data-testid={`button-remove-experience-${index}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Entreprise *</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        data-testid={`input-company-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Poste *</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        data-testid={`input-position-${index}`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        data-testid={`input-startDate-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                        data-testid={`input-endDate-${index}`}
                      />
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="mr-2"
                          data-testid={`checkbox-current-${index}`}
                        />
                        <Label htmlFor={`current-${exp.id}`}>Poste actuel</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description des missions</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Décrivez vos principales missions et réalisations..."
                      data-testid={`textarea-description-${index}`}
                    />
                  </div>
                </div>
              ))}
              
              {cvData.experiences.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune expérience ajoutée. Cliquez sur "Ajouter une expérience" pour commencer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formation et éducation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Ajoutez vos formations (la plus récente en premier)
                </p>
                <Button onClick={addEducation} size="sm" data-testid="button-add-education">
                  Ajouter une formation
                </Button>
              </div>
              
              {cvData.education.map((edu, index) => (
                <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Formation {index + 1}</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeEducation(edu.id)}
                      data-testid={`button-remove-education-${index}`}
                    >
                      Supprimer
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Établissement *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        data-testid={`input-institution-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Diplôme *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        data-testid={`input-degree-${index}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Spécialité</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      data-testid={`input-field-${index}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        data-testid={`input-edu-startDate-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        disabled={edu.current}
                        data-testid={`input-edu-endDate-${index}`}
                      />
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id={`edu-current-${edu.id}`}
                          checked={edu.current}
                          onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                          className="mr-2"
                          data-testid={`checkbox-edu-current-${index}`}
                        />
                        <Label htmlFor={`edu-current-${edu.id}`}>En cours</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {cvData.education.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune formation ajoutée. Cliquez sur "Ajouter une formation" pour commencer.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Compétences et expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Secteur d'activité *</Label>
                <Select value={cvData.sector} onValueChange={(value) => setCvData(prev => ({ ...prev, sector: value }))}>
                  <SelectTrigger data-testid="select-sector">
                    <SelectValue placeholder="Choisissez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Poste visé *</Label>
                <Input
                  value={cvData.targetPosition}
                  onChange={(e) => setCvData(prev => ({ ...prev, targetPosition: e.target.value }))}
                  placeholder="ex: Développeur Frontend, Chef de projet..."
                  data-testid="input-targetPosition"
                />
              </div>
              
              <div>
                <Label>Compétences techniques et métiers</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez une compétence et appuyez sur Entrée"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      data-testid="input-skill"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                        data-testid={`badge-skill-${index}`}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Informations complémentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Langues parlées</Label>
                <div className="space-y-3">
                  <Input
                    placeholder="ex: Anglais (courant), Espagnol (intermédiaire)..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value && !cvData.languages.includes(value)) {
                          setCvData(prev => ({ ...prev, languages: [...prev.languages, value] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    data-testid="input-language"
                  />
                  <div className="flex flex-wrap gap-2">
                    {cvData.languages.map((language, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setCvData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== language) }))}
                        data-testid={`badge-language-${index}`}
                      >
                        {language} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Certifications et formations complémentaires</Label>
                <div className="space-y-3">
                  <Input
                    placeholder="ex: Certification PMP, Formation Scrum Master..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value && !cvData.certifications.includes(value)) {
                          setCvData(prev => ({ ...prev, certifications: [...prev.certifications, value] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    data-testid="input-certification"
                  />
                  <div className="flex flex-wrap gap-2">
                    {cvData.certifications.map((cert, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setCvData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }))}
                        data-testid={`badge-certification-${index}`}
                      >
                        {cert} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Informations personnelles</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom :</strong> {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}</p>
                    <p><strong>Email :</strong> {cvData.personalInfo.email}</p>
                    {cvData.personalInfo.phone && <p><strong>Téléphone :</strong> {cvData.personalInfo.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Objectif professionnel</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Secteur :</strong> {cvData.sector}</p>
                    <p><strong>Poste visé :</strong> {cvData.targetPosition}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Expérience</h4>
                  <p className="text-sm">{cvData.experiences.length} expérience(s) professionnelle(s)</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Formation</h4>
                  <p className="text-sm">{cvData.education.length} formation(s)</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Compétences</h4>
                  <p className="text-sm">{cvData.skills.length} compétence(s)</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Autres</h4>
                  <div className="text-sm space-y-1">
                    <p>{cvData.languages.length} langue(s)</p>
                    <p>{cvData.certifications.length} certification(s)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Prêt pour la génération IA
                </h4>
                <p className="text-sm text-muted-foreground">
                  Vos informations vont être utilisées pour générer un CV professionnel optimisé pour votre secteur et poste cible.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <div>Step {currentStep}</div>;
    }
  };

  if (currentStep === totalSteps + 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Votre CV est prêt !
          </h1>
          <p className="text-muted-foreground">
            Votre CV professionnel généré par l'IA
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              CV Généré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
            </div>
            <div className="flex gap-3 mt-6 justify-center">
              <Button
                onClick={saveCv}
                disabled={createCv.isPending}
                className="gap-2"
                data-testid="button-save-cv"
              >
                <CheckCircle className="h-4 w-4" />
                {createCv.isPending ? "Sauvegarde..." : "Sauvegarder le CV"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                data-testid="button-restart-wizard"
              >
                Créer un autre CV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validation function for each step
  const canContinueToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: // Personal Info
        return !!(cvData.personalInfo.firstName.trim() && 
                 cvData.personalInfo.lastName.trim() && 
                 cvData.personalInfo.email.trim());
      case 2: // Experience
        return cvData.experiences.length > 0;
      case 3: // Education  
        return cvData.education.length > 0;
      case 4: // Skills & Sector
        return !!(cvData.sector.trim() && cvData.targetPosition.trim());
      case 5: // Skills
        return cvData.skills.length > 0;
      case 6: // Languages & Certifications
        return true; // Optional step
      default:
        return true;
    }
  };

  const canGenerateCV = (): boolean => {
    return !!(cvData.personalInfo.firstName.trim() && 
             cvData.personalInfo.lastName.trim() && 
             cvData.personalInfo.email.trim() && 
             cvData.sector.trim() && 
             cvData.targetPosition.trim() &&
             cvData.experiences.length > 0 &&
             cvData.education.length > 0 &&
             cvData.skills.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Assistant CV IA
        </h1>
        <p className="text-muted-foreground">
          Créez votre CV professionnel en quelques étapes
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Étape {currentStep} sur {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="gap-2"
          data-testid="button-previous-step"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>
        
        {currentStep === totalSteps ? (
          <Button
            onClick={generateCV}
            disabled={isGenerating || !canGenerateCV()}
            className="gap-2"
            data-testid="button-generate-cv"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Génération en cours..." : "Générer mon CV"}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
            disabled={currentStep === totalSteps || !canContinueToNextStep()}
            className="gap-2"
            data-testid="button-next-step"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}