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
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import { useEffect, useState } from 'react';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Platform logo components (normalized sizing and aspect)
const LogoImage = ({ src, alt, className }: LogoImageProps) => {
  const { processImage, isProcessing } = useBackgroundRemoval();
  const [processedSrc, setProcessedSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const combinedClassName = className ? `object-contain ${className}` : 'object-contain';

  useEffect(() => {
    const processLogo = async () => {
      setIsLoading(true);
      try {
        console.log(`Processing background removal for ${alt} logo...`);
        const processed = await processImage(src);
        setProcessedSrc(processed);
        console.log(`Background removal completed for ${alt} logo`);
      } catch (error) {
        console.error(`Failed to process ${alt} logo:`, error);
        setProcessedSrc(src);
      } finally {
        setIsLoading(false);
      }
    };

    processLogo();
  }, [src, processImage, alt]);

  return (
    <div className="relative">
      <img
        src={processedSrc}
        alt={alt}
        className={`${combinedClassName} ${isLoading || isProcessing ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
      />
      {(isLoading || isProcessing) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const RedditLogo = (props: { className?: string }) => (
  <LogoImage src={redditLogo} alt="Reddit" {...props} />
);

const TwitterLogo = (props: { className?: string }) => (
  <LogoImage src={xLogo} alt="X/Twitter" {...props} />
);

const LinkedInLogo = (props: { className?: string }) => (
  <LogoImage src={linkedinLogo} alt="LinkedIn" {...props} />
);

const FacebookLogo = (props: { className?: string }) => (
  <LogoImage src={facebookLogo} alt="Facebook" {...props} />
);

interface TopNavigationProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

type PlatformLogo = (props: { className?: string }) => JSX.Element;

const platforms: { id: Platform; name: string; logo: PlatformLogo; color: string }[] = [
  { id: 'ALL', name: 'ALL', logo: (props) => <Globe {...props} />, color: 'brand' },
  { id: 'REDDIT', name: 'Reddit', logo: RedditLogo, color: 'reddit' },
  { id: 'TWITTER', name: 'Twitter/X', logo: TwitterLogo, color: 'twitter' },
  { id: 'FACEBOOK', name: 'Facebook', logo: FacebookLogo, color: 'facebook' },
  { id: 'LINKEDIN', name: 'LinkedIn', logo: LinkedInLogo, color: 'linkedin' }
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
            {platforms.map((platform) => {
              const Logo = platform.logo;

              return (
                <Button
                  key={platform.id}
                  variant={selectedPlatform === platform.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPlatformChange(platform.id)}
                  className={`
                    flex items-center justify-center w-12 h-12 md:w-14 md:h-14 transition-all duration-200
                    ${selectedPlatform === platform.id 
                      ? 'bg-brand text-brand-foreground shadow-wun-brand' 
                      : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
                    }
                  `}
                  aria-label={`Select ${platform.name}`}
                >
                  {/* Icon container keeps consistent sizing */}
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
                    <Logo className="w-full h-full" />
                  </div>
                </Button>
              );
            })}
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
