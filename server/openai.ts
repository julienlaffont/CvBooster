// Based on javascript_openai blueprint
import OpenAI from "openai";

// Using gpt-4o-mini for better availability and cost efficiency
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CvAnalysisResult {
  score: number;
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  strengths: string[];
  improvements: string[];
}

export interface CoverLetterAnalysisResult {
  score: number;
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  personalisation: number;
  relevance: number;
}

export async function analyzeCv(cvContent: string, sector?: string, position?: string): Promise<CvAnalysisResult> {
  try {
    const prompt = `Tu es un expert en recrutement et optimisation de CV. Analyse ce CV et fournis des conseils d'amélioration.

${sector ? `Secteur visé: ${sector}` : ''}
${position ? `Poste visé: ${position}` : ''}

CV à analyser:
${cvContent}

Analyse le CV et réponds au format JSON avec:
{
  "score": nombre de 0 à 100,
  "suggestions": [
    {
      "type": "structure|contenu|presentation|competences",
      "title": "Titre court de la suggestion",
      "description": "Description détaillée de l'amélioration à apporter",
      "priority": "high|medium|low"
    }
  ],
  "strengths": ["Points forts du CV"],
  "improvements": ["Domaines d'amélioration prioritaires"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      suggestions: result.suggestions || [],
      strengths: result.strengths || [],
      improvements: result.improvements || [],
    };
  } catch (error) {
    console.error('Error analyzing CV:', error);
    throw new Error("Erreur lors de l'analyse du CV");
  }
}

export async function analyzeCoverLetter(
  letterContent: string, 
  cvContent?: string, 
  companyName?: string, 
  position?: string,
  sector?: string
): Promise<CoverLetterAnalysisResult> {
  try {
    const prompt = `Tu es un expert en lettres de motivation. Analyse cette lettre et fournis des conseils d'amélioration.

${companyName ? `Entreprise: ${companyName}` : ''}
${position ? `Poste visé: ${position}` : ''}
${sector ? `Secteur: ${sector}` : ''}

Lettre de motivation à analyser:
${letterContent}

${cvContent ? `CV de référence:\n${cvContent}` : ''}

Analyse la lettre et réponds au format JSON avec:
{
  "score": nombre de 0 à 100,
  "suggestions": [
    {
      "type": "structure|personnalisation|motivation|competences",
      "title": "Titre court de la suggestion",
      "description": "Description détaillée de l'amélioration à apporter",
      "priority": "high|medium|low"
    }
  ],
  "personalisation": nombre de 0 à 100 (niveau de personnalisation pour l'entreprise/poste),
  "relevance": nombre de 0 à 100 (pertinence par rapport au poste)
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      suggestions: result.suggestions || [],
      personalisation: Math.max(0, Math.min(100, result.personalisation || 0)),
      relevance: Math.max(0, Math.min(100, result.relevance || 0)),
    };
  } catch (error) {
    console.error('Error analyzing cover letter:', error);
    throw new Error("Erreur lors de l'analyse de la lettre de motivation");
  }
}

export async function chatWithAI(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, userContext?: {
  cvs?: Array<{ title: string; content: string; sector?: string; position?: string }>;
  sector?: string;
  position?: string;
}): Promise<string> {
  try {
    const systemMessage = `Tu es un assistant IA spécialisé dans l'amélioration des CV et lettres de motivation. Tu aides les utilisateurs à optimiser leurs candidatures pour décrocher plus d'entretiens.

Contexte utilisateur:
${userContext?.sector ? `Secteur d'activité: ${userContext.sector}` : ''}
${userContext?.position ? `Poste recherché: ${userContext.position}` : ''}
${userContext?.cvs ? `CVs disponibles: ${userContext.cvs.map(cv => `- ${cv.title} (${cv.sector || 'secteur non spécifié'})`).join('\n')}` : ''}

Réponds de manière personnalisée, pratique et bienveillante. Donne des conseils concrets et actionnable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Désolé, je n'ai pas pu traiter votre demande.";
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw new Error("Erreur lors de la conversation avec l'IA");
  }
}

export async function generateCoverLetter(
  cvContent: string,
  companyName: string,
  position: string,
  jobDescription?: string,
  sector?: string
): Promise<string> {
  try {
    const prompt = `Tu es un expert en rédaction de lettres de motivation. Génère une lettre de motivation personnalisée et professionnelle.

Informations:
- Entreprise: ${companyName}
- Poste: ${position}
${sector ? `- Secteur: ${sector}` : ''}

CV de référence:
${cvContent}

${jobDescription ? `Description du poste:\n${jobDescription}` : ''}

Génère une lettre de motivation:
- Personnalisée pour l'entreprise et le poste
- Qui met en valeur les compétences du CV
- Structure professionnelle (en-tête, intro, développement, conclusion)
- Ton professionnel mais authentique
- Longueur appropriée (300-400 mots)

Réponds uniquement avec le contenu de la lettre, sans format JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error("Erreur lors de la génération de la lettre de motivation");
  }
}