# CVBooster - AI-Powered CV/Cover Letter SaaS Platform

## Overview

CVBooster is a comprehensive SaaS platform that leverages artificial intelligence to help job seekers improve their CVs and cover letters. The platform offers intelligent analysis, personalized recommendations, and automated document generation to increase users' chances of landing job interviews. Built with modern web technologies, it features a professional landing page, user dashboard, AI chat interface, and document management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern component architecture
- **Styling**: Tailwind CSS with a custom design system based on shadcn/ui components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency
- **Design System**: Professional neutral color palette (blacks, grays, whites) with Inter font family

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **File Handling**: Multer for document uploads with support for PDF, DOC, DOCX, and TXT files
- **Authentication**: Replit Auth integration with session-based authentication
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Data Layer
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Design**: 
  - Users table for authentication and profile data
  - CVs table for storing CV content, analysis scores, and suggestions
  - Cover letters table for cover letter management
  - Conversations and messages tables for AI chat functionality
  - Sessions table for authentication state

### AI Integration
- **Provider**: OpenAI GPT-4 integration for intelligent document analysis
- **Capabilities**: 
  - CV content analysis and scoring
  - Personalized improvement suggestions
  - Cover letter generation and optimization
  - Conversational AI coaching through chat interface
- **Analysis Features**: ATS-friendly formatting recommendations and sector-specific advice

### Build & Development
- **Bundler**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with Replit-specific error handling
- **Production**: esbuild for server-side bundling and static file serving
- **Type Checking**: Comprehensive TypeScript configuration with strict mode enabled

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database for scalable data storage
- **Authentication**: Replit's OpenID Connect (OIDC) authentication service
- **AI Services**: OpenAI API for GPT-4 powered document analysis and chat functionality

### Development & Deployment
- **Platform**: Replit for hosting, development environment, and deployment
- **CDN**: Google Fonts for Inter typography
- **Error Tracking**: Replit's runtime error monitoring and development banner

### Frontend Libraries
- **UI Framework**: Radix UI component primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation and formatting

### Backend Services
- **File Processing**: Multer for multipart form data and file uploads
- **Session Management**: PostgreSQL session store with automatic cleanup
- **Security**: CORS handling and secure session configuration
- **WebSocket Support**: WebSocket constructor for Neon database connections