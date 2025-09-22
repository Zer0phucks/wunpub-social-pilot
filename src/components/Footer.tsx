import { Button } from '@/components/ui/button';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Docs', href: '/docs' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms and Conditions', href: '/terms' }
  ];

  return (
    <footer className={`bg-surface-1 border-t border-border mt-auto ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">WunPub</h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {footerLinks.map((link) => (
              <Button
                key={link.name}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <a href={link.href}>{link.name}</a>
              </Button>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WunPub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}