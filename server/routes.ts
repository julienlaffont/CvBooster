// Based on javascript_log_in_with_replit blueprint and custom API routes
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeCv, analyzeCoverLetter, chatWithAI, generateCoverLetter } from "./openai";
import { z } from "zod";
import { 
  insertCvSchema, 
  insertCoverLetterSchema,
  insertConversationSchema,
  insertMessageSchema,
  updateCvSchema,
  updateCoverLetterSchema 
} from "@shared/schema";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";
import sharp from "sharp";
import OpenAI from "openai";

// Suppress TypeScript errors for untyped modules
// @ts-ignore
import pdfParse from 'pdf-parse';

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOC, DOCX, and TXT files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez PDF, DOC, DOCX ou TXT.'));
    }
  }
});

// Photo upload configuration
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    // Accept image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.'));
    }
  }
});

// Text extraction function
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8');
    }
    
    if (file.mimetype === 'application/pdf') {
      try {
        // Use dynamic import to avoid startup crash
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(file.buffer);
        return data.text;
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return `[Erreur lors de l'extraction du PDF: ${file.originalname}]\n\nVeuillez convertir votre fichier en DOCX ou TXT pour une meilleure extraction du texte.`;
      }
    }
    
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    
    if (file.mimetype === 'application/msword') {
      // For .doc files, mammoth can handle some cases
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value;
      } catch (error) {
        return `[Erreur lors de l'extraction du fichier .doc: ${file.originalname}]\n\nVeuillez convertir votre fichier en PDF ou DOCX pour une meilleure extraction du texte.`;
      }
    }
    
    return `[Type de fichier non pris en charge: ${file.originalname}]\n\nVeuillez utiliser un fichier PDF, DOCX ou TXT.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `[Erreur lors de l'extraction du texte: ${file.originalname}]\n\nVeuillez vérifier que votre fichier n'est pas corrompu et réessayer.`;
  }
}

// Validation middleware
function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data', details: error });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File Upload Routes
  app.post('/api/upload/cv', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier uploadé' });
      }

      const userId = req.user.claims.sub;
      const { title, sector, position } = req.body;
      
      // Extract text content from file
      const content = await extractTextFromFile(req.file);
      
      // Create CV with extracted content
      const cv = await storage.createCv({
        userId,
        title: title || req.file.originalname,
        content,
        sector,
        position,
        status: 'draft'
      });
      
      res.status(201).json({ cv, message: 'CV uploadé avec succès' });
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      if (error.message.includes('Type de fichier')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erreur lors de l\'upload du CV' });
    }
  });

  app.post('/api/upload/cover-letter', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier uploadé' });
      }

      const userId = req.user.claims.sub;
      const { title, companyName, position, sector } = req.body;
      
      // Extract text content from file
      const content = await extractTextFromFile(req.file);
      
      // Create cover letter with extracted content
      const letter = await storage.createCoverLetter({
        userId,
        title: title || req.file.originalname,
        content,
        companyName,
        position,
        sector,
        status: 'draft'
      });
      
      res.status(201).json({ letter, message: 'Lettre uploadée avec succès' });
    } catch (error: any) {
      console.error('Error uploading cover letter:', error);
      if (error.message.includes('Type de fichier')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erreur lors de l\'upload de la lettre' });
    }
  });

  // CV Routes
  app.get('/api/cvs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userCvs = await storage.getUserCvs(userId);
      res.json(userCvs);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      res.status(500).json({ error: 'Failed to fetch CVs' });
    }
  });

  app.get('/api/cvs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cv = await storage.getCv(req.params.id, userId);
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      res.json(cv);
    } catch (error) {
      console.error('Error fetching CV:', error);
      res.status(500).json({ error: 'Failed to fetch CV' });
    }
  });

  app.post('/api/cvs', isAuthenticated, validateBody(insertCvSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cvData = { ...req.validatedBody, userId };
      const cv = await storage.createCv(cvData);
      res.status(201).json(cv);
    } catch (error) {
      console.error('Error creating CV:', error);
      res.status(500).json({ error: 'Failed to create CV' });
    }
  });

  app.put('/api/cvs/:id', isAuthenticated, validateBody(updateCvSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.validatedBody;
      const cv = await storage.updateCv(req.params.id, userId, updates);
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      res.json(cv);
    } catch (error: any) {
      console.error('Error updating CV:', error);
      if (error.message === 'CV not found') {
        return res.status(404).json({ error: 'CV not found' });
      }
      res.status(500).json({ error: 'Failed to update CV' });
    }
  });

  app.delete('/api/cvs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteCv(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting CV:', error);
      res.status(500).json({ error: 'Failed to delete CV' });
    }
  });

  // CV Analysis Route
  app.post('/api/cvs/:id/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cv = await storage.getCv(req.params.id, userId);
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }

      const analysis = await analyzeCv(cv.content, cv.sector || undefined, cv.position || undefined);
      
      // Update CV with analysis results
      const updatedCv = await storage.updateCv(req.params.id, userId, {
        score: analysis.score,
        suggestions: analysis.suggestions,
        status: 'optimized'
      });
      
      res.json({ cv: updatedCv, analysis });
    } catch (error) {
      console.error('Error analyzing CV:', error);
      res.status(500).json({ error: 'Failed to analyze CV' });
    }
  });

  // Cover Letter Routes
  app.get('/api/cover-letters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letters = await storage.getUserCoverLetters(userId);
      res.json(letters);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      res.status(500).json({ error: 'Failed to fetch cover letters' });
    }
  });

  app.get('/api/cover-letters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letter = await storage.getCoverLetter(req.params.id, userId);
      if (!letter) {
        return res.status(404).json({ error: 'Cover letter not found' });
      }
      res.json(letter);
    } catch (error) {
      console.error('Error fetching cover letter:', error);
      res.status(500).json({ error: 'Failed to fetch cover letter' });
    }
  });

  app.post('/api/cover-letters', isAuthenticated, validateBody(insertCoverLetterSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letterData = { ...req.validatedBody, userId };
      const letter = await storage.createCoverLetter(letterData);
      res.status(201).json(letter);
    } catch (error) {
      console.error('Error creating cover letter:', error);
      res.status(500).json({ error: 'Failed to create cover letter' });
    }
  });

  app.put('/api/cover-letters/:id', isAuthenticated, validateBody(updateCoverLetterSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.validatedBody;
      const letter = await storage.updateCoverLetter(req.params.id, userId, updates);
      if (!letter) {
        return res.status(404).json({ error: 'Cover letter not found' });
      }
      res.json(letter);
    } catch (error: any) {
      console.error('Error updating cover letter:', error);
      if (error.message === 'Cover letter not found') {
        return res.status(404).json({ error: 'Cover letter not found' });
      }
      res.status(500).json({ error: 'Failed to update cover letter' });
    }
  });

  app.delete('/api/cover-letters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteCoverLetter(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      res.status(500).json({ error: 'Failed to delete cover letter' });
    }
  });

  // Cover Letter Analysis Route
  app.post('/api/cover-letters/:id/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const letter = await storage.getCoverLetter(req.params.id, userId);
      if (!letter) {
        return res.status(404).json({ error: 'Cover letter not found' });
      }

      const analysis = await analyzeCoverLetter(
        letter.content,
        undefined, // cv content - could be enhanced later
        letter.companyName || undefined,
        letter.position || undefined,
        letter.sector || undefined
      );
      
      // Update cover letter with analysis results
      const updatedLetter = await storage.updateCoverLetter(req.params.id, userId, {
        score: analysis.score,
        suggestions: analysis.suggestions,
        status: 'optimized'
      });
      
      res.json({ letter: updatedLetter, analysis });
    } catch (error) {
      console.error('Error analyzing cover letter:', error);
      res.status(500).json({ error: 'Failed to analyze cover letter' });
    }
  });

  // Generate Cover Letter from Existing CV Route  
  app.post('/api/cover-letters/generate-from-cv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cvId, companyName, position, jobDescription, sector } = req.body;
      
      if (!cvId || !companyName || !position) {
        return res.status(400).json({ error: 'Missing required fields: cvId, companyName, position' });
      }
      
      const cv = await storage.getCv(cvId, userId);
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      
      const generatedContent = await generateCoverLetter(
        cv.content,
        companyName,
        position,
        jobDescription,
        sector
      );
      
      // Create the cover letter
      const letter = await storage.createCoverLetter({
        userId,
        title: `Lettre - ${companyName}`,
        content: generatedContent,
        companyName,
        position,
        sector,
        status: 'draft'
      });
      
      res.status(201).json(letter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      res.status(500).json({ error: 'Failed to generate cover letter' });
    }
  });

  // Chat/Conversation Routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post('/api/conversations', isAuthenticated, validateBody(insertConversationSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = { ...req.validatedBody, userId };
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getConversationMessages(req.params.id, userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }
      
      // Verify conversation belongs to user
      const conversation = await storage.getConversation(req.params.id, userId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Create user message
      const userMessage = await storage.createMessage({
        conversationId: req.params.id,
        role: 'user',
        content
      });
      
      // Get conversation history
      const messages = await storage.getConversationMessages(req.params.id, userId);
      
      // Get user context (CVs for better AI responses)
      const userCvs = await storage.getUserCvs(userId);
      const cvContext = userCvs.map(cv => ({
        title: cv.title,
        content: cv.content,
        sector: cv.sector || undefined,
        position: cv.position || undefined
      }));
      
      // Generate AI response
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      const aiResponse = await chatWithAI(chatHistory, {
        cvs: cvContext
      });
      
      // Create AI message
      const aiMessage = await storage.createMessage({
        conversationId: req.params.id,
        role: 'assistant',
        content: aiResponse
      });
      
      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // AI CV Generation from wizard data
  app.post('/api/cvs/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { personalInfo, experiences, education, skills, languages, certifications, sector, targetPosition } = req.body;
      
      // Validate required fields
      if (!personalInfo?.firstName || !personalInfo?.lastName || !sector || !targetPosition) {
        return res.status(400).json({ error: 'Informations obligatoires manquantes' });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create detailed prompt for CV generation
      const prompt = `Génère un CV professionnel en français pour:

INFORMATIONS PERSONNELLES:
- Nom: ${personalInfo.firstName} ${personalInfo.lastName}
- Email: ${personalInfo.email}
- Téléphone: ${personalInfo.phone || 'Non renseigné'}
- Adresse: ${personalInfo.address || 'Non renseigné'}
- LinkedIn: ${personalInfo.linkedIn || 'Non renseigné'}
- Résumé: ${personalInfo.summary || 'À définir'}

OBJECTIF PROFESSIONNEL:
- Secteur: ${sector}
- Poste visé: ${targetPosition}

EXPÉRIENCES PROFESSIONNELLES:
${(experiences || []).map((exp: any) => `
- ${exp.position} chez ${exp.company} (${exp.startDate} - ${exp.current ? 'Actuellement' : exp.endDate})
  ${exp.description || 'Description à définir'}
`).join('')}

FORMATION:
${(education || []).map((edu: any) => `
- ${edu.degree} en ${edu.field} à ${edu.institution} (${edu.startDate} - ${edu.current ? 'En cours' : edu.endDate})
`).join('')}

COMPÉTENCES:
${(skills || []).join(', ')}

LANGUES:
${(languages || []).join(', ')}

CERTIFICATIONS:
${(certifications || []).join(', ')}

INSTRUCTIONS:
1. Crée un CV professionnel structuré et optimisé ATS
2. Utilise un format français standard avec sections claires
3. Adapte le contenu au secteur "${sector}" et au poste "${targetPosition}"
4. Optimise les descriptions d'expériences avec des verbes d'action et des résultats mesurables
5. Assure-toi que le CV soit cohérent et professionnel
6. Utilise des mots-clés pertinents pour le secteur visé
7. Structure: En-tête, Résumé professionnel, Expériences, Formation, Compétences, Langues, Certifications
8. Ne pas inventer d'informations non fournies
9. Garder un ton professionnel et adapté au marché français`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en rédaction de CV français. Tu crées des CV professionnels optimisés pour les ATS (Applicant Tracking Systems) et adaptés au marché du travail français. Tu es spécialisé dans l'adaptation du contenu selon le secteur d'activité et le poste visé."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const generatedContent = response.choices[0]?.message?.content || 'CV généré avec succès';

      res.status(200).json({ 
        content: generatedContent,
        message: 'CV généré avec succès par l\'IA',
        sector,
        targetPosition
      });
    } catch (error: any) {
      console.error('Error generating CV:', error);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Configuration OpenAI manquante' });
      }
      res.status(500).json({ error: 'Erreur lors de la génération du CV' });
    }
  });

  // AI-powered Cover Letter Generation
  app.post('/api/cover-letters/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyName, position, sector, personalInfo, experience, motivations } = req.body;
      
      if (!companyName || !position) {
        return res.status(400).json({ error: 'Nom de l\'entreprise et poste requis' });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Génère une lettre de motivation professionnelle en français pour:

ENTREPRISE ET POSTE:
- Entreprise: ${companyName}
- Poste: ${position}
- Secteur: ${sector || 'Non spécifié'}

INFORMATIONS PERSONNELLES:
- Nom: ${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}
- Email: ${personalInfo?.email || ''}
- Téléphone: ${personalInfo?.phone || ''}

EXPÉRIENCE PERTINENTE:
${(experience || []).map((exp: any) => `
- ${exp.position} chez ${exp.company} (${exp.duration || 'Durée non spécifiée'})
  ${exp.description || ''}
`).join('')}

MOTIVATIONS:
${motivations || 'Fortement motivé(e) à rejoindre cette entreprise'}

INSTRUCTIONS:
1. Crée une lettre de motivation personnalisée et convaincante
2. Structure: En-tête, Introduction, Corps (2-3 paragraphes), Conclusion
3. Adapte le ton et le vocabulaire au secteur d'activité
4. Mets en avant les compétences pertinentes pour le poste
5. Montre une connaissance de l'entreprise et du secteur
6. Utilise un français professionnel et impeccable
7. Reste authentique et évite les clichés
8. Longueur optimale: 250-400 mots`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en rédaction de lettres de motivation françaises. Tu crées des lettres personnalisées, convaincantes et adaptées au marché du travail français. Tu connais les conventions professionnelles françaises et adaptes ton style selon le secteur d'activité."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const generatedContent = response.choices[0]?.message?.content || 'Lettre générée avec succès';

      res.status(200).json({ 
        content: generatedContent,
        message: 'Lettre de motivation générée avec succès par l\'IA',
        companyName,
        position,
        sector
      });
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Configuration OpenAI manquante' });
      }
      res.status(500).json({ error: 'Erreur lors de la génération de la lettre' });
    }
  });

  // AI CV Analysis and Optimization Suggestions
  app.post('/api/cvs/analyze-advanced', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { cvId, targetSector, targetPosition } = req.body;
      
      if (!cvId) {
        return res.status(400).json({ error: 'ID du CV requis' });
      }

      const cv = await storage.getCv(cvId, userId);
      if (!cv) {
        return res.status(404).json({ error: 'CV non trouvé' });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Analyse ce CV français et fournis des suggestions d'amélioration détaillées:

CONTENU DU CV:
${cv.content}

OBJECTIF PROFESSIONNEL:
- Secteur visé: ${targetSector || cv.sector || 'Non spécifié'}
- Poste visé: ${targetPosition || cv.position || 'Non spécifié'}

MISSION D'ANALYSE:
1. Évalue la structure et la présentation
2. Analyse la pertinence du contenu pour le poste visé
3. Vérifie l'optimisation ATS (mots-clés, formatage)
4. Évalue l'impact des descriptions d'expériences
5. Contrôle la cohérence et la progression de carrière
6. Suggestions d'amélioration concrètes

RÉSULTAT ATTENDU au format JSON:
{
  "score": number (0-100),
  "strengths": ["point fort 1", "point fort 2", ...],
  "improvements": [
    {
      "category": "Structure|Contenu|ATS|Expérience|Cohérence",
      "issue": "description du problème",
      "suggestion": "suggestion d'amélioration précise",
      "priority": "haute|moyenne|faible"
    }
  ],
  "atsOptimization": {
    "missingKeywords": ["mot-clé manquant 1", ...],
    "formatIssues": ["problème de format 1", ...],
    "score": number (0-100)
  },
  "careerAdvice": "conseil de carrière personnalisé",
  "nextSteps": ["prochaine étape 1", "prochaine étape 2", ...]
}

Fournis une analyse détaillée et constructive en français.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en recrutement et optimisation de CV français. Tu analyses les CV selon les standards du marché français et fournis des conseils précis pour maximiser les chances de décrocher un entretien. Tu comprends les spécificités sectorielles et les attentes des ATS."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const analysisResult = JSON.parse(response.choices[0]?.message?.content || '{}');

      // Update CV with analysis results
      await storage.updateCv(cvId, userId, {
        score: analysisResult.score,
        suggestions: analysisResult,
        status: 'analyzed'
      });

      res.status(200).json(analysisResult);
    } catch (error: any) {
      console.error('Error analyzing CV:', error);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Configuration OpenAI manquante' });
      }
      res.status(500).json({ error: 'Erreur lors de l\'analyse du CV' });
    }
  });

  // Personalized Career Advice
  app.post('/api/career/advice', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { currentSector, targetSector, experience, skills, goals } = req.body;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Fournis des conseils de carrière personnalisés pour ce profil professionnel français:

PROFIL ACTUEL:
- Secteur actuel: ${currentSector || 'Non spécifié'}
- Secteur visé: ${targetSector || 'Non spécifié'}
- Expérience: ${experience || 'Non spécifié'}
- Compétences: ${(skills || []).join(', ') || 'Non spécifié'}
- Objectifs: ${goals || 'Évolution de carrière'}

CONTEXTE DU MARCHÉ FRANÇAIS 2024:
- Considère les tendances actuelles du marché de l'emploi français
- Intègre les impacts de la digitalisation et de l'IA
- Tiens compte des évolutions sectorielles post-COVID
- Adapte aux spécificités du marché du travail français

CONSEILS DEMANDÉS au format JSON:
{
  "marketInsights": "analyse du marché et tendances",
  "skillsGap": ["compétence manquante 1", "compétence manquante 2", ...],
  "actionPlan": [
    {
      "action": "action à entreprendre",
      "timeframe": "délai",
      "priority": "haute|moyenne|faible",
      "resources": "ressources nécessaires"
    }
  ],
  "certifications": ["certification recommandée 1", ...],
  "networking": "conseils de réseautage spécifiques",
  "salaryInsights": "insights sur les salaires et négociation",
  "nextOpportunities": ["opportunité 1", "opportunité 2", ...]
}

Fournis des conseils concrets et actionnables adaptés au contexte français.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un conseiller en évolution professionnelle expert du marché français. Tu connais les tendances sectorielles, les attentes des employeurs français, et les meilleures stratégies pour réussir sa carrière en France. Tu fournis des conseils pragmatiques et personnalisés."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const careerAdvice = JSON.parse(response.choices[0]?.message?.content || '{}');

      res.status(200).json(careerAdvice);
    } catch (error: any) {
      console.error('Error generating career advice:', error);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Configuration OpenAI manquante' });
      }
      res.status(500).json({ error: 'Erreur lors de la génération des conseils' });
    }
  });

  // Smart Dashboard Statistics with AI Insights
  app.get('/api/dashboard/ai-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's documents and statistics
      const cvs = await storage.getUserCvs(userId);
      const coverLetters = await storage.getUserCoverLetters(userId);
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Analyze user's profile for personalized insights
      const userProfile = {
        totalCVs: cvs.length,
        totalCoverLetters: coverLetters.length,
        averageScore: cvs.length > 0 ? Math.round(cvs.reduce((sum: number, cv: any) => sum + (cv.score || 0), 0) / cvs.length) : 0,
        sectors: Array.from(new Set(cvs.map((cv: any) => cv.sector).filter(Boolean))),
        positions: Array.from(new Set(cvs.map((cv: any) => cv.position).filter(Boolean))),
        recentActivity: cvs.concat(coverLetters).sort((a: any, b: any) => 
          new Date(b.updatedAt || new Date()).getTime() - new Date(a.updatedAt || new Date()).getTime()
        ).slice(0, 5)
      };

      const prompt = `Analyse ce profil utilisateur et fournis des insights personnalisés:

PROFIL UTILISATEUR:
- Nombre de CV: ${userProfile.totalCVs}
- Nombre de lettres: ${userProfile.totalCoverLetters}
- Score moyen des CV: ${userProfile.averageScore}/100
- Secteurs d'intérêt: ${userProfile.sectors.join(', ') || 'Aucun spécifié'}
- Postes visés: ${userProfile.positions.join(', ') || 'Aucun spécifié'}

FOURNIS au format JSON:
{
  "profileInsights": "analyse du profil et progression",
  "recommendations": [
    {
      "type": "amélioration|opportunité|formation|networking",
      "title": "titre de la recommandation",
      "description": "description détaillée",
      "actionable": true/false,
      "urgency": "haute|moyenne|faible"
    }
  ],
  "marketTrends": "tendances du marché pertinentes pour ce profil",
  "nextGoals": ["objectif 1", "objectif 2", ...],
  "performanceScore": number (0-100),
  "motivationalMessage": "message personnalisé et motivant"
}

Sois personnalisé, constructif et motivant.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un coach carrière IA qui analyse les profils utilisateurs pour fournir des insights personnalisés et des recommandations actionnables. Tu es motivant, précis et adapté au contexte professionnel français."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const aiInsights = JSON.parse(response.choices[0]?.message?.content || '{}');

      // Combine basic stats with AI insights
      const enhancedStats = {
        ...userProfile,
        aiInsights,
        lastUpdated: new Date().toISOString()
      };

      res.status(200).json(enhancedStats);
    } catch (error: any) {
      console.error('Error generating AI dashboard stats:', error);
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'Configuration OpenAI manquante' });
      }
      res.status(500).json({ error: 'Erreur lors de la génération des statistiques IA' });
    }
  });

  // Photo upload and enhancement functionality
  app.post('/api/upload/photo', isAuthenticated, photoUpload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune photo uploadée' });
      }

      const userId = req.user.claims.sub;
      
      // Convert image to base64 data URL for storage
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Update user profile with new image
      const user = await storage.updateUserProfileImage(userId, base64Image);
      
      res.status(200).json({ 
        user, 
        message: 'Photo uploadée avec succès',
        imageUrl: base64Image
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      if (error.message.includes('Type de fichier')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
    }
  });

  // AI Photo Enhancement Analysis
  app.post('/api/photo/analyze', isAuthenticated, photoUpload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune photo fournie pour l\'analyse' });
      }

      // Convert to base64 for OpenAI Vision API
      const base64Image = req.file.buffer.toString('base64');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Use OpenAI Vision to analyze the photo
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyse cette photo de profil professionnel et fournis des suggestions d'amélioration en français. Évalue la qualité de l'éclairage, l'arrière-plan, la composition, et l'apparence professionnelle. Donne des conseils pratiques et concrets."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const analysis = response.choices[0]?.message?.content || 'Analyse non disponible';
      
      // Calculate a simple score based on analysis keywords
      const positiveKeywords = ['professionnel', 'bien', 'bon', 'excellent', 'optimal', 'clair', 'net'];
      const negativeKeywords = ['flou', 'sombre', 'mauvais', 'améliorer', 'problème'];
      
      let score = 50; // Base score
      positiveKeywords.forEach(keyword => {
        if (analysis.toLowerCase().includes(keyword)) score += 10;
      });
      negativeKeywords.forEach(keyword => {
        if (analysis.toLowerCase().includes(keyword)) score -= 10;
      });
      
      score = Math.min(100, Math.max(0, score)); // Clamp between 0-100

      res.status(200).json({ 
        analysis,
        score,
        suggestions: analysis.split('.').filter(s => s.trim().length > 0).slice(0, 5) // Extract key suggestions
      });
    } catch (error: any) {
      console.error('Error analyzing photo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'analyse de la photo' });
    }
  });

  // AI Photo Enhancement - Actual Image Processing
  app.post('/api/photo/enhance', isAuthenticated, photoUpload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune photo fournie pour l\'amélioration' });
      }

      // Professional photo enhancement using Sharp
      const enhancedImageBuffer = await sharp(req.file.buffer)
        .resize(512, 512, {
          fit: 'cover',
          position: 'center'
        })
        .normalize() // Normalize brightness/contrast
        .sharpen({ sigma: 1.2 }) // Light sharpening for crisp look
        .modulate({
          brightness: 1.05, // Slight brightness boost
          saturation: 1.1,  // Slight saturation boost
          hue: 0
        })
        .jpeg({
          quality: 92,
          progressive: true
        })
        .toBuffer();

      // Convert enhanced image to base64 data URL
      const enhancedBase64 = `data:image/jpeg;base64,${enhancedImageBuffer.toString('base64')}`;
      
      res.status(200).json({ 
        enhancedImage: enhancedBase64,
        message: 'Photo améliorée avec succès',
        improvements: [
          'Recadrage professionnel (format carré)',
          'Normalisation de la luminosité et du contraste', 
          'Amélioration de la netteté',
          'Optimisation des couleurs',
          'Compression optimisée pour le web'
        ]
      });
    } catch (error: any) {
      console.error('Error enhancing photo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'amélioration de la photo' });
    }
  });

  // Apply Enhanced Photo as Profile Picture
  app.post('/api/photo/apply-enhanced', isAuthenticated, async (req: any, res) => {
    try {
      const { enhancedImageData } = req.body;
      
      if (!enhancedImageData) {
        return res.status(400).json({ error: 'Données d\'image améliorée manquantes' });
      }

      const userId = req.user.claims.sub;
      
      // Update user profile with enhanced image
      const user = await storage.updateUserProfileImage(userId, enhancedImageData);
      
      res.status(200).json({ 
        user, 
        message: 'Photo améliorée appliquée comme photo de profil'
      });
    } catch (error: any) {
      console.error('Error applying enhanced photo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'application de la photo améliorée' });
    }
  });

  // ATS-friendly CV Export functionality
  function formatCvForATS(cv: any): string {
    // ATS-friendly formatting: preserve structure while keeping it clean
    let formattedCv = '';
    
    // Header with contact info
    formattedCv += `${cv.title || 'CV'}\n\n`;
    
    // Add content with ATS-friendly structure that preserves readability
    if (cv.content) {
      // Clean up the content while preserving French characters and structure
      const cleanContent = cv.content
        .replace(/[^\p{L}\p{N}\s\-\.@(),:/\n\r•\-+'#&]/gu, ' ')  // Keep Unicode letters, numbers, and critical ATS punctuation like +, #, ', &
        .replace(/[ \t]+/g, ' ')  // Normalize horizontal whitespace only
        .replace(/\n{3,}/g, '\n\n')  // Limit consecutive line breaks to max 2
        .replace(/•/g, '-')  // Convert bullets to ATS-safe dashes
        .trim();
        
      formattedCv += cleanContent;
    }
    
    formattedCv += '\n\n---\n';
    formattedCv += `Secteur: ${cv.sector || 'Non spécifié'}\n`;
    formattedCv += `Poste visé: ${cv.position || 'Non spécifié'}\n`;
    
    return formattedCv;
  }

  // Export CV as TXT (most ATS-friendly)
  app.get('/api/cvs/:id/export/txt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cv = await storage.getCv(req.params.id, userId);
      
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      
      const formattedContent = formatCvForATS(cv);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.title || 'CV'}_ATS.txt"`);
      res.send(formattedContent);
    } catch (error) {
      console.error('Error exporting CV as TXT:', error);
      res.status(500).json({ error: 'Failed to export CV' });
    }
  });

  // Export CV as PDF (ATS-compatible)
  app.get('/api/cvs/:id/export/pdf', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cv = await storage.getCv(req.params.id, userId);
      
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      
      const formattedContent = formatCvForATS(cv);
      
      // Create ATS-friendly PDF with jsPDF and pagination
      const doc = new jsPDF();
      
      // Use standard fonts for ATS compatibility
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      // Set up pagination parameters
      const pageHeight = doc.internal.pageSize.height;
      const lineHeight = 6;
      const margin = 20;
      const maxY = pageHeight - margin;
      let currentY = margin;
      
      // Split content into lines for PDF with pagination
      const lines = doc.splitTextToSize(formattedContent, 170);
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (currentY + lineHeight > maxY) {
          doc.addPage();
          currentY = margin;
        }
        
        // Add the line
        doc.text(lines[i], margin, currentY);
        currentY += lineHeight;
      }
      
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.title || 'CV'}_ATS.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error exporting CV as PDF:', error);
      res.status(500).json({ error: 'Failed to export CV as PDF' });
    }
  });

  // Export CV as DOCX (ATS-compatible)
  app.get('/api/cvs/:id/export/docx', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cv = await storage.getCv(req.params.id, userId);
      
      if (!cv) {
        return res.status(404).json({ error: 'CV not found' });
      }
      
      const formattedContent = formatCvForATS(cv);
      
      // Create ATS-friendly DOCX document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cv.title || 'CV',
                    bold: true,
                    size: 32, // 16pt
                    font: 'Arial' // ATS-friendly font
                  })
                ]
              }),
              new Paragraph({
                children: [new TextRun({ text: "" })] // Empty line
              }),
              ...formattedContent.split('\n').map(line => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Arial',
                      size: 22 // 11pt
                    })
                  ]
                })
              )
            ]
          }
        ]
      });
      
      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${cv.title || 'CV'}_ATS.docx"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting CV as DOCX:', error);
      res.status(500).json({ error: 'Failed to export CV as DOCX' });
    }
  });

  // Dashboard Stats Route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [cvs, coverLetters, conversations] = await Promise.all([
        storage.getUserCvs(userId),
        storage.getUserCoverLetters(userId),
        storage.getUserConversations(userId)
      ]);
      
      const totalDocuments = cvs.length + coverLetters.length;
      const avgScore = totalDocuments > 0 
        ? Math.round([...cvs, ...coverLetters].reduce((sum, doc) => sum + (doc.score || 0), 0) / totalDocuments)
        : 0;
      const totalSuggestions = [...cvs, ...coverLetters].reduce((sum, doc) => {
        const suggestions = Array.isArray(doc.suggestions) ? doc.suggestions : [];
        return sum + suggestions.length;
      }, 0);
      
      res.json({
        documents: totalDocuments,
        averageScore: avgScore,
        totalSuggestions,
        cvCount: cvs.length,
        coverLetterCount: coverLetters.length,
        conversationCount: conversations.length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
