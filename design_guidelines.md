# Design Guidelines: AI-Powered CV/Cover Letter SaaS Platform

## Design Approach
**Selected Approach**: Design System (Material Design + Custom Refinements)
**Justification**: This is a productivity-focused SaaS application requiring efficiency, learnability, and professional credibility. The utility-focused nature demands consistent patterns over visual experimentation.

## Core Design Elements

### A. Color Palette
**Neutral Professional Colors:**
- Dark Mode: 0 0% 9% (deep charcoal background), 0 0% 95% (crisp white text)
- Light Mode: 0 0% 15% (dark charcoal), 0 0% 100% (pure white background)
- Brand Accent: 0 0% 25% (professional charcoal for CTAs and highlights)
- Gray Scale: 0 0% 85% (light gray), 0 0% 65% (medium gray), 0 0% 45% (dark gray)

### B. Typography
**Font System**: Inter via Google Fonts CDN
- Headings: Inter 600-700 (semibold to bold)
- Body text: Inter 400-500 (regular to medium)  
- Scale: text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### C. Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4, gap-4 (16px) 
- Section spacing: p-6, m-6 (24px)
- Large spacing: p-8, m-8 (32px)

### D. Component Library

**Navigation**: Fixed dark sidebar with subtle hover states, clean icons from Heroicons
**Forms**: Consistent input styling with focus rings, validation states in amber/red
**Cards**: Subtle elevation with border styling, consistent padding-6
**Buttons**: Primary (solid brand blue), secondary (outline), minimal hover animations
**Data Display**: Clean tables, document preview cards, progress indicators
**Overlays**: Modal dialogs for document uploads, confirmation prompts

## Page-Specific Guidelines

### Landing Page
**Visual Treatment**: Professional, serious and trustworthy
- Hero: Large centered content with neutral gradient background (0 0% 15% to 0 0% 12%)
- Sections: Header, Features, Call-to-action, Testimonials, Footer
- Contrast: High contrast black/white text for credibility and readability
- Clean typography-focused design without decorative elements
- Neutral colors throughout: white backgrounds, black/charcoal text, gray accents

### Dashboard
**Layout**: Sidebar navigation + main content area
- Document grid with preview thumbnails
- Quick action buttons for new documents
- Recent activity feed
- Clean, scannable information hierarchy

### Document Editor
**Interface**: Split-pane layout
- Left: Document content/editor
- Right: AI suggestions panel
- Consistent with productivity tool patterns
- Minimal visual distractions to maintain focus

**Critical Constraint**: Maintain professional credibility through consistent, clean design patterns. Avoid decorative elements that might undermine the serious, career-focused nature of the application.