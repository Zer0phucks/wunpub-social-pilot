import { Platform } from '../WunPubLayout';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import redditLogo from '@/assets/reddit-logo.png';
import xLogo from '@/assets/x-logo.png';
import linkedinLogo from '@/assets/linkedin-logo.png';
import facebookLogo from '@/assets/facebook-logo.png';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useNavigate } from 'react-router-dom';

// Platform logo components (normalized sizing and aspect)
const LogoImage = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="w-5 h-5 md:w-6 md:h-6 object-contain"
    loading="lazy"
    decoding="async"
  />
);

const RedditLogo = () => <LogoImage src={redditLogo} alt="Reddit" />;
const TwitterLogo = () => <LogoImage src={xLogo} alt="X/Twitter" />;
const LinkedInLogo = () => <LogoImage src={linkedinLogo} alt="LinkedIn" />;
const FacebookLogo = () => <LogoImage src={facebookLogo} alt="Facebook" />;

interface TopNavigationProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

const platforms = [
  { id: 'ALL' as Platform, name: 'ALL', logo: Globe, color: 'brand' },
  { id: 'REDDIT' as Platform, name: 'Reddit', logo: RedditLogo, color: 'reddit' },
  { id: 'TWITTER' as Platform, name: 'Twitter/X', logo: TwitterLogo, color: 'twitter' },
  { id: 'FACEBOOK' as Platform, name: 'Facebook', logo: FacebookLogo, color: 'facebook' },
  { id: 'LINKEDIN' as Platform, name: 'LinkedIn', logo: LinkedInLogo, color: 'linkedin' }
];

export function TopNavigation({ selectedPlatform, onPlatformChange }: TopNavigationProps) {
  const supabase = useSupabase();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-surface-1 border-b border-border shadow-wun-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">WunPub</h1>
          </div>
          
          <nav className="flex items-center justify-between flex-1 max-w-2xl">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onPlatformChange(platform.id)}
                className={`
                  flex items-center justify-center w-10 h-10 transition-all duration-200
                  ${selectedPlatform === platform.id 
                    ? 'bg-brand text-brand-foreground shadow-wun-brand' 
                    : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
                  }
                `}
                aria-label={`Select ${platform.name}`}
              >
                {/* Icon container to prevent stretching */}
                <div className="flex items-center justify-center w-6 h-6">
                  <platform.logo />
                </div>
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            className="border-border hover:bg-surface-2"
          >
            Connect Platform
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
