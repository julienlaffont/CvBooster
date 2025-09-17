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

// Type declarations for modules without types
declare module 'pdf-parse';
declare module 'html-pdf-node';

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

  // Generate Cover Letter Route
  app.post('/api/cover-letters/generate', isAuthenticated, async (req: any, res) => {
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
