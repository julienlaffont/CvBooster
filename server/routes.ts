// Based on javascript_log_in_with_replit blueprint and custom API routes
import type { Express } from "express";
import express from "express";
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
import Stripe from "stripe";
import argon2 from "argon2";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// Note: pdf-parse is dynamically imported in extractTextFromFile function

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Simple cache for demo responses to improve performance
const demoCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCachedResponse(key: string): any | null {
  const cached = demoCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  demoCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: any, ttlMs = 300000): void { // 5 minute default TTL
  demoCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  
  // Simple cleanup: remove old entries when cache gets large
  if (demoCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of demoCache.entries()) {
      if (now - v.timestamp > v.ttl) {
        demoCache.delete(k);
      }
    }
  }
}

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

// Extended authentication middleware that supports both Replit Auth and email/password sessions
function isAuthenticatedExtended(req: any, res: any, next: any) {
  // Check if user is authenticated via Replit Auth
  if (req.user && req.user.claims && req.user.claims.sub) {
    return next();
  }
  
  // Check if user is authenticated via email/password session
  if (req.session && req.session.userId) {
    // Create a normalized user object for compatibility
    req.user = {
      claims: {
        sub: req.session.userId
      }
    };
    return next();
  }
  
  // If neither authentication method worked, return unauthorized
  return res.status(401).json({ message: 'Unauthorized' });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Email/password authentication schemas
  const registerSchema = z.object({
    email: z.string().email('Email non valide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
  });

  const loginSchema = z.object({
    email: z.string().email('Email non valide'),
    password: z.string().min(1, 'Mot de passe requis')
  });

  // Auth routes - Email/Password Registration
  app.post('/api/auth/register', authLimiter, async (req: any, res) => {
    try {
      const { email, password } = registerSchema.parse(req.body);
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if user already exists
      const existingUser = await storage.findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.passwordHash) {
        // Return generic error to prevent account enumeration
        return res.status(400).json({ error: 'Cette adresse email ne peut pas être utilisée' });
      }
      
      // Hash password
      const passwordHash = await argon2.hash(password);
      
      let user;
      if (existingUser && !existingUser.passwordHash) {
        // User exists from Replit Auth but no password, add password
        user = await storage.setUserPassword(existingUser.id, passwordHash);
      } else {
        // Create new user
        user = await storage.createEmailUser(normalizedEmail, passwordHash);
      }
      
      // Generate email verification token and hash it
      const verificationToken = crypto.randomBytes(32).toString('base64url');
      const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
      await storage.setEmailVerification(user.id, tokenHash, null);
      
      // Regenerate session ID to prevent fixation
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ error: 'Erreur de session' });
        }
        
        // Create session (login immediately)
        req.session.userId = user.id;
        
        const response: any = { 
          message: 'Compte créé avec succès',
          user: { id: user.id, email: user.email }
        };
        
        // Only include verification URL in development
        if (process.env.NODE_ENV !== 'production') {
          response.verificationUrl = `/api/auth/verify?token=${verificationToken}`;
        }
        
        res.status(201).json(response);
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0]?.message || 'Données invalides' });
      }
      res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
  });

  // Auth routes - Email/Password Login
  app.post('/api/auth/login', authLimiter, async (req: any, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      // Find user by email
      const user = await storage.findUserByEmail(normalizedEmail);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      // Verify password
      const passwordValid = await argon2.verify(user.passwordHash, password);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      // Regenerate session ID to prevent fixation
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ error: 'Erreur de session' });
        }
        
        // Create session
        req.session.userId = user.id;
        
        res.json({ 
          message: 'Connexion réussie',
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
        });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0]?.message || 'Données invalides' });
      }
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });

  // Auth routes - Logout
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Déconnexion réussie' });
    });
  });

  // Auth routes - Email Verification
  app.get('/api/auth/verify', async (req: any, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token de vérification requis' });
      }
      
      // Hash the provided token to match stored hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await storage.getUserByVerificationToken(tokenHash);
      if (!user) {
        return res.status(400).json({ error: 'Token de vérification invalide ou expiré' });
      }
      
      // Mark email as verified and clear token
      await storage.setEmailVerification(user.id, null, new Date());
      
      // Redirect to subscribe page with success message
      res.redirect('/subscribe?verified=true');
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticatedExtended, async (req: any, res) => {
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
  app.post('/api/upload/cv', isAuthenticatedExtended, upload.single('file'), async (req: any, res) => {
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

  app.post('/api/upload/cover-letter', isAuthenticatedExtended, upload.single('file'), async (req: any, res) => {
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
  app.get('/api/cvs', isAuthenticatedExtended, async (req: any, res) => {
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

  app.post('/api/cvs', isAuthenticatedExtended, validateBody(insertCvSchema), async (req: any, res) => {
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

  // AI CV Analysis - Demo version (no authentication required)
  app.post('/api/cvs/analyze-demo', async (req: any, res) => {
    try {
      const { content, sector, position } = req.body;
      
      if (!content || content.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Contenu du CV trop court. Minimum 50 caractères requis.' 
        });
      }

      // Limit content length for demo (5000 characters)
      if (content.length > 5000) {
        return res.status(400).json({ 
          error: 'Contenu du CV trop long pour la démo. Limite: 5000 caractères.' 
        });
      }

      // For demo: Use mock analysis if OpenAI quota is exceeded
      try {
        const analysis = await analyzeCv(content, sector, position);
        
        res.json({ 
          analysis: {
            ...analysis,
            isDemo: true,
            note: 'Connectez-vous pour sauvegarder l\'analyse et accéder aux fonctionnalités avancées'
          }
        });
      } catch (aiError: any) {
        // If OpenAI is not available, return a realistic mock analysis
        console.log('OpenAI unavailable for demo, using mock analysis');
        
        const mockAnalysis = {
          score: Math.floor(Math.random() * 30) + 65, // Score between 65-95
          suggestions: [
            {
              type: "contenu",
              title: "Enrichir les descriptions d'expérience",
              description: "Ajoutez des résultats quantifiés et des accomplissements spécifiques pour chaque poste.",
              priority: "high"
            },
            {
              type: "structure",
              title: "Optimiser la mise en forme",
              description: "Utilisez des puces et une structure claire pour améliorer la lisibilité.",
              priority: "medium"
            },
            {
              type: "competences",
              title: "Compétences techniques",
              description: "Mettez en avant les compétences demandées pour le poste visé.",
              priority: "high"
            }
          ],
          strengths: [
            "Expérience pertinente dans le domaine",
            "Progression de carrière cohérente",
            "Compétences techniques adaptées"
          ],
          improvements: [
            "Ajouter des métriques de performance",
            "Optimiser pour les systèmes ATS",
            "Personnaliser pour le secteur ciblé"
          ]
        };

        res.json({ 
          analysis: {
            ...mockAnalysis,
            isDemo: true,
            isMock: true,
            note: 'Analyse de démonstration. Connectez-vous pour une analyse IA complète et personnalisée.'
          }
        });
      }
    } catch (error: any) {
      console.error('Error in CV analysis demo:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'analyse du CV. Veuillez réessayer.',
        code: 'cv_analysis_error'
      });
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

  // Cover Letter Generation - Demo version (no authentication required)
  app.post('/api/cover-letters/generate-demo', async (req: any, res) => {
    try {
      const { cvContent, companyName, position, jobDescription, sector } = req.body;
      
      if (!cvContent || !companyName || !position) {
        return res.status(400).json({ 
          error: 'Contenu CV, nom de l\'entreprise et poste requis.' 
        });
      }

      if (cvContent.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Contenu du CV trop court. Minimum 50 caractères requis.' 
        });
      }

      // Limit content length for demo
      if (cvContent.length > 5000) {
        return res.status(400).json({ 
          error: 'Contenu du CV trop long pour la démo. Limite: 5000 caractères.' 
        });
      }

      // For demo: Use mock generation if OpenAI quota is exceeded
      try {
        const generatedContent = await generateCoverLetter(
          cvContent,
          companyName,
          position,
          jobDescription,
          sector
        );
        
        res.json({ 
          content: generatedContent,
          title: `Lettre - ${companyName}`,
          companyName,
          position,
          sector,
          isDemo: true,
          note: 'Connectez-vous pour sauvegarder cette lettre et accéder aux fonctionnalités avancées'
        });
      } catch (aiError: any) {
        // If OpenAI is not available, return a realistic mock cover letter
        console.log('OpenAI unavailable for demo, using mock cover letter');
        
        const mockCoverLetter = `Objet : Candidature pour le poste de ${position}

Madame, Monsieur,

Je vous écris pour exprimer mon vif intérêt pour le poste de ${position} au sein de ${companyName}. Ayant pris connaissance de cette opportunité, je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste.

Fort(e) de mon expérience professionnelle et de mes compétences techniques, je souhaite apporter ma contribution au développement de votre équipe. Mon parcours m'a permis d'acquérir une expertise solide que je serais ravi(e) de mettre au service de ${companyName}.

${sector ? `Passionné(e) par le secteur ${sector.toLowerCase()}, ` : ''}je suis particulièrement motivé(e) par les défis que représente ce poste et les perspectives d'évolution qu'il offre. Ma capacité d'adaptation et mon sens du travail en équipe me permettront de m'intégrer rapidement et efficacement.

Je serais ravi(e) de vous rencontrer pour discuter plus en détail de ma candidature et vous démontrer comment mes compétences peuvent contribuer au succès de vos projets.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Cordialement,
[Votre nom]`;

        res.json({ 
          content: mockCoverLetter,
          title: `Lettre - ${companyName}`,
          companyName,
          position,
          sector,
          isDemo: true,
          isMock: true,
          note: 'Lettre de démonstration. Connectez-vous pour une génération IA personnalisée et complète.'
        });
      }
    } catch (error: any) {
      console.error('Error in cover letter generation demo:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération de la lettre. Veuillez réessayer.',
        code: 'cover_letter_generation_error'
      });
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
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle OpenAI-specific errors from chatWithAI function
      if (error.message?.includes('Quota OpenAI dépassé')) {
        return res.status(429).json({ 
          error: error.message,
          code: 'quota_exceeded'
        });
      }
      
      if (error.message?.includes('Limite de taux OpenAI')) {
        return res.status(429).json({ 
          error: error.message,
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('Configuration OpenAI invalide')) {
        return res.status(500).json({ 
          error: error.message,
          code: 'config_error'
        });
      }
      
      if (error.message?.includes('Modèle OpenAI non disponible')) {
        return res.status(500).json({ 
          error: error.message,
          code: 'model_error'
        });
      }
      
      if (error.message?.includes('Erreur du service IA')) {
        return res.status(500).json({ 
          error: error.message,
          code: 'ai_service_error'
        });
      }
      
      // Generic error
      res.status(500).json({ 
        error: error.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
        code: 'chat_error'
      });
    }
  });

  // AI CV Generation from wizard data
  app.post('/api/cvs/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { personalInfo, experiences, education, skills, languages, certifications, sector, targetPosition } = req.body;
      
      // Validate required fields
      if (!personalInfo?.firstName?.trim() || !personalInfo?.lastName?.trim() || !sector?.trim() || !targetPosition?.trim()) {
        return res.status(400).json({ 
          error: 'Veuillez remplir tous les champs obligatoires : prénom, nom, secteur d\'activité et poste visé.' 
        });
      }

      // Check if user can generate a free CV
      const canGenerateFreeCv = await storage.canUserGenerateFreeCv(userId);
      if (!canGenerateFreeCv) {
        return res.status(403).json({ 
          error: 'Vous avez épuisé votre génération de CV gratuite. Choisissez un plan pour continuer.',
          code: 'free_limit_exceeded',
          type: 'cv'
        });
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

      let generatedContent;
      
      try {
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

        generatedContent = response.choices[0]?.message?.content || 'CV généré avec succès';
      } catch (openaiError: any) {
        // Fallback for testing when OpenAI quota is exceeded
        if (openaiError.code === 'insufficient_quota' || openaiError.status === 429) {
          console.log('OpenAI quota exceeded, using fallback content for testing');
          generatedContent = `# CV PROFESSIONNEL - ${personalInfo.firstName} ${personalInfo.lastName}

## INFORMATIONS PERSONNELLES
- **Nom:** ${personalInfo.firstName} ${personalInfo.lastName}
- **Email:** ${personalInfo.email}
- **Téléphone:** ${personalInfo.phone || 'À définir'}
- **Adresse:** ${personalInfo.address || 'À définir'}
- **LinkedIn:** ${personalInfo.linkedIn || 'À définir'}

## RÉSUMÉ PROFESSIONNEL
${personalInfo.summary || 'Professionnel expérimenté dans le secteur ' + sector + ' recherchant un poste de ' + targetPosition + '. Expertise démontrée et passion pour l\'excellence opérationnelle.'}

## OBJECTIF PROFESSIONNEL
Poste visé: **${targetPosition}** dans le secteur **${sector}**

## EXPÉRIENCES PROFESSIONNELLES
${(experiences || []).map((exp: any) => `
### ${exp.position} - ${exp.company}
*${exp.startDate} - ${exp.current ? 'Actuellement' : exp.endDate}*

${exp.description || 'Responsabilités clés et réalisations dans ce poste.'}
`).join('')}

## FORMATION
${(education || []).map((edu: any) => `
### ${edu.degree} en ${edu.field}
**${edu.institution}** - ${edu.startDate} - ${edu.current ? 'En cours' : edu.endDate}
`).join('')}

## COMPÉTENCES TECHNIQUES
${(skills || []).join(' • ')}

## LANGUES
${(languages || []).join(' • ')}

${(certifications || []).length > 0 ? '## CERTIFICATIONS\n' + (certifications || []).join(' • ') : ''}

---
*CV généré par CVBooster - Version de test*`;
        } else {
          throw openaiError;
        }
      }

      // Increment free CV usage counter after successful generation
      await storage.incrementFreeCvUsage(userId);

      res.status(200).json({ 
        content: generatedContent,
        message: 'CV généré avec succès par l\'IA',
        sector,
        targetPosition
      });
    } catch (error: any) {
      console.error('Error generating CV:', error);
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      if (error.code === 'model_not_found') {
        return res.status(500).json({ 
          error: 'Modèle OpenAI non disponible. Veuillez contacter le support.',
          code: 'model_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de la génération du CV. Veuillez réessayer.',
        code: 'generation_error'
      });
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

      // Check if user can generate a free cover letter
      const canGenerateFreeCoverLetter = await storage.canUserGenerateFreeCoverLetter(userId);
      if (!canGenerateFreeCoverLetter) {
        return res.status(403).json({ 
          error: 'Vous avez épuisé votre génération de lettre gratuite. Choisissez un plan pour continuer.',
          code: 'free_limit_exceeded',
          type: 'cover-letter'
        });
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

      let generatedContent;
      
      try {
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

        generatedContent = response.choices[0]?.message?.content || 'Lettre générée avec succès';
      } catch (openaiError: any) {
        // Fallback for testing when OpenAI quota is exceeded
        if (openaiError.code === 'insufficient_quota' || openaiError.status === 429) {
          console.log('OpenAI quota exceeded, using fallback content for cover letter testing');
          generatedContent = `${personalInfo?.firstName || 'Prénom'} ${personalInfo?.lastName || 'Nom'}
${personalInfo?.email || 'email@exemple.com'}
${personalInfo?.phone || 'Téléphone'}

${companyName}
À l'attention du service des Ressources Humaines

Objet : Candidature pour le poste de ${position}

Madame, Monsieur,

Actuellement à la recherche de nouvelles opportunités professionnelles dans le secteur ${sector || 'de votre entreprise'}, je me permets de vous adresser ma candidature pour le poste de ${position} au sein de ${companyName}.

Fort(e) d'une expérience significative dans mon domaine, je suis particulièrement motivé(e) par l'opportunité de rejoindre votre équipe et de contribuer au développement de vos projets. Mon parcours professionnel m'a permis d'acquérir les compétences nécessaires pour réussir dans ce poste.

${motivations || 'Je suis convaincu(e) que mon profil correspond parfaitement aux exigences de ce poste et que je pourrai apporter une réelle valeur ajoutée à votre entreprise.'}

Je serais ravi(e) de pouvoir vous rencontrer pour échanger davantage sur ma candidature et vous présenter en détail mes motivations pour rejoindre ${companyName}.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${personalInfo?.firstName || 'Prénom'} ${personalInfo?.lastName || 'Nom'}

---
*Lettre de motivation générée par CVBooster - Version de test*`;
        } else {
          throw openaiError;
        }
      }

      // Increment free cover letter usage counter after successful generation
      await storage.incrementFreeCoverLetterUsage(userId);

      res.status(200).json({ 
        content: generatedContent,
        message: 'Lettre de motivation générée avec succès par l\'IA',
        companyName,
        position,
        sector
      });
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de la génération de la lettre. Veuillez réessayer.',
        code: 'generation_error'
      });
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
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de l\'analyse du CV. Veuillez réessayer.',
        code: 'analysis_error'
      });
    }
  });

  // AI Chat/Coaching - Demo version (no authentication required)
  app.post('/api/chat/demo', async (req: any, res) => {
    try {
      const { message, userContext } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Message requis pour le coaching IA.' 
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({ 
          error: 'Message trop long pour la démo. Limite: 1000 caractères.' 
        });
      }

      // For demo: Use mock response if OpenAI quota is exceeded
      try {
        const chatHistory = [{ role: 'user' as const, content: message }];
        const aiResponse = await chatWithAI(chatHistory, userContext);
        
        res.json({ 
          response: aiResponse,
          isDemo: true,
          note: 'Session de coaching de démonstration. Connectez-vous pour des conversations personnalisées et sauvegardées.'
        });
      } catch (aiError: any) {
        // If OpenAI is not available, return a realistic mock coaching response
        console.log('OpenAI unavailable for demo, using mock coaching response');
        
        const mockResponses = [
          `Merci de votre question ! Pour vous aider au mieux dans votre recherche d'emploi, je vous recommande de :

1. **Personnaliser votre CV** pour chaque poste en adaptant les mots-clés et l'expérience mise en avant
2. **Préparer vos entretiens** en recherchant l'entreprise et en préparant des exemples concrets de vos réalisations
3. **Développer votre réseau professionnel** via LinkedIn et les événements de votre secteur

Avez-vous un CV que vous aimeriez améliorer ou une candidature spécifique en cours ?`,

          `Excellente question ! Le marché de l'emploi évolue constamment. Voici quelques conseils clés :

• **Mettez en avant vos compétences transférables** - elles sont souvent plus valorisées que l'expérience directe
• **Optimisez votre présence en ligne** - Un profil LinkedIn à jour peut faire la différence
• **Préparez un pitch de 30 secondes** sur qui vous êtes et ce que vous apportez

Dans quel secteur cherchez-vous à évoluer ? Je peux vous donner des conseils plus spécifiques.`,

          `C'est un défi commun ! Voici comment structurer une approche efficace :

**Pour votre CV :**
- Utilisez des verbes d'action et quantifiez vos résultats
- Adaptez le contenu à chaque offre d'emploi
- Gardez une mise en page claire et professionnelle

**Pour vos candidatures :**
- Rédigez des lettres de motivation personnalisées
- Montrez votre connaissance de l'entreprise
- Mettez en avant votre valeur ajoutée unique

Quelle est votre plus grande difficulté actuellement dans vos candidatures ?`
        ];

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

        res.json({ 
          response: randomResponse,
          isDemo: true,
          isMock: true,
          note: 'Réponse de démonstration. Connectez-vous pour un coaching IA personnalisé et complet.'
        });
      }
    } catch (error: any) {
      console.error('Error in chat demo:', error);
      res.status(500).json({ 
        error: 'Erreur lors du coaching IA. Veuillez réessayer.',
        code: 'chat_demo_error'
      });
    }
  });

  // Multi-sector Career Advice Demo (no authentication required)
  app.post('/api/career/advice/demo', async (req: any, res) => {
    try {
      const { currentSector, targetSector, experience, skills, goals } = req.body;
      
      if (!currentSector && !targetSector) {
        return res.status(400).json({ 
          error: 'Au moins un secteur (actuel ou visé) est requis pour la démo.' 
        });
      }

      // Create cache key based on input parameters
      const cacheKey = `career-advice:${currentSector || 'none'}:${targetSector || 'none'}:${(skills || []).join(',')}`;
      
      // Check cache first for improved performance
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        return res.json({
          ...cachedResponse,
          cached: true,
          note: 'Conseils de carrière de démonstration (depuis cache). Connectez-vous pour des analyses IA personnalisées.'
        });
      }

      // For demo: Use mock response if OpenAI quota is exceeded
      try {
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

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

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
        
        const responseData = {
          ...careerAdvice,
          isDemo: true,
          note: 'Conseils de carrière de démonstration. Connectez-vous pour des analyses approfondies et sauvegardées.'
        };

        // Cache the OpenAI response for improved performance
        setCachedResponse(cacheKey, responseData);
        
        res.status(200).json(responseData);
        
      } catch (aiError: any) {
        // If OpenAI is not available, return realistic mock career advice
        console.log('OpenAI unavailable for demo, using mock career advice');
        
        const createMockAdvice = (current: string, target: string) => {
          const sectorTransitions = {
            'Informatique': {
              to: {
                'Finance': {
                  marketInsights: 'La FinTech connaît une croissance de 15% par an en France. Les banques digitales recherchent activement des développeurs avec une compréhension du métier financier.',
                  skillsGap: ['Réglementation financière', 'Sécurité bancaire', 'Blockchain', 'Analyse quantitative'],
                  networking: 'Participez aux meetups FinTech Paris, rejoignez les associations comme Finance Innovation, suivez les leaders de la FinTech française sur LinkedIn.'
                },
                'Santé': {
                  marketInsights: 'La HealthTech française représente 2,5 milliards d\'euros. Le vieillissement de la population crée de nouveaux besoins en solutions digitales de santé.',
                  skillsGap: ['Réglementation RGPD santé', 'Normes ISO 27001', 'Interopérabilité des systèmes de santé', 'IA médicale'],
                  networking: 'Rejoignez France Biotech, participez aux événements Health Tech Hub, connectez-vous avec des professionnels de santé innovants.'
                }
              }
            },
            'Marketing': {
              to: {
                'Informatique': {
                  marketInsights: 'Les compétences en marketing digital sont très recherchées dans la tech. Le Growth Hacking et l\'analyse de données sont essentiels.',
                  skillsGap: ['SQL et analyse de données', 'A/B testing', 'Marketing automation', 'Analytics avancé'],
                  networking: 'Rejoignez les communautés Growth Hacking France, participez aux meetups data marketing, suivez les influenceurs GrowthTech.'
                }
              }
            }
          };

          const mockAdvice = {
            marketInsights: `Transition ${current} vers ${target}: Le marché français offre de belles opportunités pour cette évolution. La digitalisation accélère les besoins en profils hybrides maîtrisant les deux secteurs.`,
            skillsGap: ['Compétences sectorielles spécifiques', 'Certifications professionnelles', 'Connaissance réglementaire', 'Soft skills managériales'],
            actionPlan: [
              {
                action: 'Formation complémentaire dans le secteur cible',
                timeframe: '3-6 mois',
                priority: 'haute',
                resources: 'CNAM, formations en ligne spécialisées, MOOCs sectoriels'
              },
              {
                action: 'Développement du réseau professionnel',
                timeframe: '6-12 mois',
                priority: 'haute', 
                resources: 'LinkedIn, événements sectoriels, associations professionnelles'
              },
              {
                action: 'Acquisition d\'expérience pratique',
                timeframe: '6-18 mois',
                priority: 'moyenne',
                resources: 'Missions freelance, projets personnels, stages courte durée'
              }
            ],
            certifications: ['Certification sectorielle reconnue', 'Formations continues spécialisées', 'Diplôme complémentaire si nécessaire'],
            networking: 'Participez aux événements sectoriels, rejoignez les associations professionnelles du secteur cible, développez votre présence LinkedIn avec du contenu pertinent.',
            salaryInsights: `Transition ${current} → ${target}: Préparez-vous à une période d'adaptation salariale. Négociez sur la base de vos compétences transférables et du potentiel d'évolution.`,
            nextOpportunities: ['Postes de transition hybrides', 'Missions de conseil intersectorielles', 'Startups innovantes aux frontières des secteurs']
          };

          // Customize based on specific sector transition if available
          if (sectorTransitions[current]?.to[target]) {
            const specific = sectorTransitions[current].to[target];
            mockAdvice.marketInsights = specific.marketInsights;
            mockAdvice.skillsGap = specific.skillsGap;
            mockAdvice.networking = specific.networking;
          }

          return mockAdvice;
        };

        const mockAdvice = createMockAdvice(currentSector || 'Généraliste', targetSector || currentSector || 'Évolution');

        const responseData = {
          ...mockAdvice,
          isDemo: true,
          isMock: true,
          note: 'Conseils de carrière de démonstration basés sur des données sectorielles françaises. Connectez-vous pour des analyses IA personnalisées.'
        };

        // Cache the response for improved performance  
        setCachedResponse(cacheKey, responseData);

        res.status(200).json(responseData);
      }
    } catch (error: any) {
      console.error('Error in career advice demo:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération des conseils de carrière. Veuillez réessayer.',
        code: 'career_advice_demo_error'
      });
    }
  });

  // Professional Export Demo - Generate sample PDF (no authentication required)
  app.get('/api/export/demo-pdf', async (req: any, res) => {
    try {
      // Create a demo CV for PDF export
      const demoCV = {
        title: 'Jean Dupont - Développeur Full Stack',
        content: `JEAN DUPONT
📧 jean.dupont@email.com | 📱 06 12 34 56 78 | 💼 LinkedIn: jean-dupont

PROFIL PROFESSIONNEL
Développeur Full Stack passionné avec 3 ans d'expérience dans la création d'applications web modernes. Spécialisé en React, Node.js et bases de données. Recherche un poste de Lead Developer dans une startup innovante.

EXPÉRIENCE PROFESSIONNELLE

Développeur Full Stack | TechStart SAS | Mars 2022 - Présent
- Développement d'une plateforme e-commerce avec React et Node.js
- Amélioration des performances de 40% grâce à l'optimisation du code
- Formation de 2 développeurs juniors
- Technologies: React, TypeScript, PostgreSQL, AWS

Développeur Frontend | WebAgency | Janvier 2021 - Février 2022
- Création de sites web responsives pour 15+ clients
- Intégration d'APIs REST et GraphQL
- Collaboration avec l'équipe UX/UI
- Technologies: Vue.js, Sass, Webpack

FORMATION
Master Informatique | Université Paris-Saclay | 2020
Licence Informatique | Université Paris-Saclay | 2018

COMPÉTENCES TECHNIQUES
- Frontend: React, Vue.js, TypeScript, HTML5, CSS3, Sass
- Backend: Node.js, Express, Python, Django
- Bases de données: PostgreSQL, MongoDB, Redis
- Outils: Git, Docker, AWS, CI/CD

LANGUES
- Français: Natif
- Anglais: Courant (TOEIC 850)
- Espagnol: Intermédiaire

CENTRES D'INTÉRÊT
Contribution open source, Veille technologique, Escalade`,
        sector: 'Informatique et Technologies',
        position: 'Lead Developer'
      };
      
      const formattedContent = formatCvForATS(demoCV);
      
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
      
      // Add demo watermark
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Document de démonstration - CVBooster.fr', margin, pageHeight - 10);
      
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="CV_Demo_CVBooster.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating demo PDF:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la génération du PDF de démonstration.',
        code: 'demo_pdf_error'
      });
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
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de la génération des conseils. Veuillez réessayer.',
        code: 'advice_error'
      });
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
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de la génération des statistiques IA. Veuillez réessayer.',
        code: 'stats_error'
      });
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
      
      // Handle specific OpenAI API errors
      if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
        return res.status(429).json({ 
          error: 'Quota OpenAI dépassé. Veuillez vérifier la configuration ou réessayer plus tard.',
          code: 'quota_exceeded'
        });
      }
      
      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        return res.status(429).json({ 
          error: 'Limite de taux OpenAI dépassée. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit'
        });
      }
      
      if (error.message?.includes('API key') || error.code === 'invalid_api_key') {
        return res.status(500).json({ 
          error: 'Configuration OpenAI invalide. Veuillez vérifier la clé API.',
          code: 'config_error'
        });
      }
      
      // Generic OpenAI error
      if (error.name === 'OpenAIError' || error.status) {
        return res.status(500).json({ 
          error: 'Erreur du service IA. Veuillez réessayer plus tard.',
          code: 'ai_service_error'
        });
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de l\'analyse de la photo. Veuillez réessayer.',
        code: 'photo_analysis_error'
      });
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

  // AI Photo Enhancement - Demo version (no authentication required)
  app.post('/api/photo/enhance-demo', photoUpload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune photo fournie pour l\'amélioration' });
      }

      // Check file size for demo (limit to 5MB for non-authenticated users)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Taille de fichier trop importante pour la démo. Limite: 5MB.' });
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
        message: 'Photo améliorée avec succès (version démo)',
        improvements: [
          'Recadrage professionnel (format carré)',
          'Normalisation de la luminosité et du contraste', 
          'Amélioration de la netteté',
          'Optimisation des couleurs',
          'Compression optimisée pour le web'
        ],
        isDemo: true,
        note: 'Connectez-vous pour sauvegarder et utiliser cette photo comme photo de profil'
      });
    } catch (error: any) {
      console.error('Error enhancing photo (demo):', error);
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
        .replace(/[^a-zA-ZÀ-ÿ0-9\s\-\.@(),:/\n\r•\-+'#&]/g, ' ')  // Keep letters, numbers, French chars, and critical ATS punctuation
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

  // Stripe Subscription Routes

  // Activate free plan for new users
  app.post('/api/subscription/activate-free', isAuthenticatedExtended, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Update user to have active debutant plan
      const user = await storage.updateUserSubscriptionPlan(userId, 'debutant', 'active');
      
      res.json({ 
        message: 'Plan gratuit activé avec succès',
        plan: 'debutant',
        status: 'active'
      });
    } catch (error) {
      console.error('Error activating free plan:', error);
      res.status(500).json({ error: 'Erreur lors de l\'activation du plan gratuit' });
    }
  });

  // Get user subscription status
  app.get('/api/subscription/status', isAuthenticatedExtended, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptionInfo = await storage.getUserSubscriptionInfo(userId);
      
      if (!subscriptionInfo) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(subscriptionInfo);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  });

  // Create subscription for Pro or Expert plan
  app.post('/api/subscription/create', isAuthenticatedExtended, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      if (!plan || !['pro', 'expert'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan. Must be "pro" or "expert"' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.email) {
        return res.status(400).json({ error: 'User email is required for subscription' });
      }
      
      let customerId = user.stripeCustomerId;
      
      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        });
        
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }
      
      // Use stable price IDs for Pro and Expert plans
      // Note: These should be created once in Stripe Dashboard and stored as env vars
      const priceIds = {
        pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
        expert: process.env.STRIPE_EXPERT_PRICE_ID || 'price_expert_placeholder'
      };
      
      const priceId = priceIds[plan as keyof typeof priceIds];
      
      if (!priceId || priceId.includes('placeholder')) {
        return res.status(500).json({ 
          error: 'Pricing configuration not found. Please configure STRIPE_PRO_PRICE_ID and STRIPE_EXPERT_PRICE_ID environment variables.' 
        });
      }
      
      // Create a setup intent to collect payment method first
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          plan: plan,
          userId: userId,
          priceId: priceId
        }
      });
      
      res.json({
        clientSecret: setupIntent.client_secret,
        customerId: customerId,
        plan,
        priceId,
        amount: plan === 'pro' ? 2000 : 5000,
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription', details: error.message });
    }
  });

  // Confirm subscription after setup intent is complete
  app.post('/api/subscription/confirm', isAuthenticatedExtended, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { setupIntentId, plan, priceId } = req.body;
      
      if (!setupIntentId || !plan || !priceId) {
        return res.status(400).json({ error: 'Setup Intent ID, plan, and price ID are required' });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ error: 'User or Stripe customer not found' });
      }
      
      // Retrieve the setup intent to get the payment method
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      
      if (setupIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Setup Intent not completed' });
      }
      
      // Create the subscription using the payment method from setup intent
      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        default_payment_method: setupIntent.payment_method as string,
        metadata: {
          plan: plan,
          userId: userId
        }
      });
      
      // Update user with subscription info
      await storage.updateUserStripeInfo(userId, user.stripeCustomerId, subscription.id);
      await storage.updateUserSubscriptionPlan(userId, plan as any, subscription.status === 'active' ? 'active' : 'inactive');
      
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        plan
      });
      
    } catch (error: any) {
      console.error('Error confirming subscription:', error);
      res.status(500).json({ error: 'Failed to confirm subscription', details: error.message });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptionInfo = await storage.getUserSubscriptionInfo(userId);
      
      if (!subscriptionInfo?.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Cancel the subscription at period end
      const subscription = await stripe.subscriptions.update(
        subscriptionInfo.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      
      // Update user subscription status
      await storage.updateUserSubscriptionPlan(userId, 'debutant', 'cancelled');
      
      res.json({ 
        message: 'Subscription cancelled successfully',
        cancelAt: subscription.cancel_at 
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
    }
  });

  // Check user's feature access
  app.get('/api/subscription/features', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptionInfo = await storage.getUserSubscriptionInfo(userId);
      
      if (!subscriptionInfo) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { subscriptionPlan, subscriptionStatus } = subscriptionInfo;
      const isActive = subscriptionStatus === 'active';
      
      const features = {
        plan: subscriptionPlan,
        status: subscriptionStatus,
        cvAnalysis: subscriptionPlan === 'debutant' ? { limit: 1, unlimited: false } : { unlimited: true },
        coverLetters: subscriptionPlan === 'debutant' ? { limit: 1, unlimited: false } : { unlimited: true },
        chat: isActive && subscriptionPlan !== 'debutant',
        premiumTemplates: isActive && subscriptionPlan !== 'debutant',
        atsOptimization: isActive && subscriptionPlan !== 'debutant',
        photoImprovement: isActive && subscriptionPlan !== 'debutant',
        advancedExport: isActive && subscriptionPlan !== 'debutant',
        prioritySupport: isActive && subscriptionPlan !== 'debutant',
        careerCoaching: isActive && subscriptionPlan === 'expert',
        advancedStats: isActive && subscriptionPlan === 'expert',
        apiAccess: isActive && subscriptionPlan === 'expert',
      };
      
      res.json(features);
    } catch (error) {
      console.error('Error fetching features:', error);
      res.status(500).json({ error: 'Failed to fetch features' });
    }
  });

  // Stripe webhook for handling subscription updates
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    
    // In production, you should set STRIPE_WEBHOOK_SECRET
    // For development, we'll skip signature verification
    try {
      let event;
      
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // Development mode - parse JSON directly
        event = JSON.parse(req.body.toString());
      }
      
      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            // Update subscription status to active
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            
            // Find user by Stripe customer ID
            // Note: We need a way to find user by stripeCustomerId - let's add this method
            // For now, we'll skip this update and handle it in the frontend after successful payment
          }
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          
          // Find user and update subscription status
          // Implementation would require a new storage method to find user by stripeCustomerId
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  });

  // User Usage Route for subscription limits
  app.get('/api/user/usage', isAuthenticatedExtended, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usageInfo = await storage.getUserFreeTrialStatus(userId);
      
      if (!usageInfo) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Calculate remaining generations for free plan (max 3 CVs, 2 cover letters)
      const cvGenerationsCount = usageInfo.freeCvsGenerated;
      const coverLetterGenerationsCount = usageInfo.freeCoverLettersGenerated;
      const canGenerateCV = cvGenerationsCount < 3;
      const canGenerateCoverLetter = coverLetterGenerationsCount < 2;
      
      res.json({
        cvGenerationsCount,
        coverLetterGenerationsCount,
        canGenerateCV,
        canGenerateCoverLetter
      });
    } catch (error) {
      console.error('Error fetching user usage:', error);
      res.status(500).json({ error: 'Failed to fetch user usage' });
    }
  });

  // Dashboard Stats Route
  app.get('/api/dashboard/stats', isAuthenticatedExtended, async (req: any, res) => {
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
