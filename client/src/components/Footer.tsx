import { Link } from "wouter";
import { Twitter, Linkedin, Instagram, Github } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/">
              <Logo data-testid="link-footer-home" className="hover:opacity-80 transition-opacity" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              L'outil IA qui transforme tes candidatures et t'aide à décrocher le job de tes rêves.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produit</h3>
            <div className="space-y-2">
              <Link href="#features">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-features">
                  Fonctionnalités
                </span>
              </Link>
              <Link href="#pricing">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-pricing">
                  Tarifs
                </span>
              </Link>
              <Link href="/demo">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-demo">
                  Démo
                </span>
              </Link>
              <Link href="/templates">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-templates">
                  Templates
                </span>
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Ressources</h3>
            <div className="space-y-2">
              <Link href="/blog">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-blog">
                  Blog
                </span>
              </Link>
              <Link href="/guides">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-guides">
                  Guides CV
                </span>
              </Link>
              <Link href="/faq">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-faq">
                  FAQ
                </span>
              </Link>
              <Link href="/support">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-support">
                  Support
                </span>
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <div className="space-y-2">
              <Link href="/about">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-about">
                  À propos
                </span>
              </Link>
              <Link href="/privacy">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-privacy">
                  Confidentialité
                </span>
              </Link>
              <Link href="/terms">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-terms">
                  CGU
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-contact">
                  Contact
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CVBooster. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/cvbooster" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter" data-testid="link-social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/cvbooster" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn" data-testid="link-social-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/cvbooster" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram" data-testid="link-social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/cvbooster" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub" data-testid="link-social-github">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <span className="text-sm text-muted-foreground">Conçu en France</span>
          </div>
        </div>
      </div>
    </footer>
  );
}