import { UserButton } from '@clerk/clerk-react';
import { Platform } from '../WunPubLayout';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import redditLogo from '@/assets/reddit-logo.png';
import xLogo from '@/assets/x-logo.png';
import linkedinLogo from '@/assets/linkedin-logo.png';
import facebookLogo from '@/assets/facebook-logo.png';

// Platform logo components
const RedditLogo = () => (
  <img src={redditLogo} alt="Reddit" className="w-5 h-5" />
);

const TwitterLogo = () => (
  <img src={xLogo} alt="X/Twitter" className="w-5 h-5" />
);

const LinkedInLogo = () => (
  <img src={linkedinLogo} alt="LinkedIn" className="w-5 h-5" />
);

const FacebookLogo = () => (
  <img src={facebookLogo} alt="Facebook" className="w-5 h-5" />
);

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
                  flex items-center space-x-2 px-4 py-2 h-10 transition-all duration-200
                  ${selectedPlatform === platform.id 
                    ? 'bg-brand text-brand-foreground shadow-wun-brand' 
                    : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <platform.logo />
                <span className="font-medium">{platform.name}</span>
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
          <UserButton 
            afterSignOutUrl="/auth"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}