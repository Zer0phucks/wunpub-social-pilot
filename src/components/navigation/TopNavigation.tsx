import { Platform } from '../WunPubLayout';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

const platforms = [
  { id: 'ALL' as Platform, name: 'ALL', icon: '🌐', color: 'brand' },
  { id: 'REDDIT' as Platform, name: 'Reddit', icon: '📱', color: 'reddit' },
  { id: 'TWITTER' as Platform, name: 'Twitter/X', icon: '🐦', color: 'twitter' },
  { id: 'FACEBOOK' as Platform, name: 'Facebook', icon: '👥', color: 'facebook' },
  { id: 'LINKEDIN' as Platform, name: 'LinkedIn', icon: '💼', color: 'linkedin' }
];

export function TopNavigation({ selectedPlatform, onPlatformChange }: TopNavigationProps) {
  return (
    <header className="bg-surface-1 border-b border-border shadow-wun-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">WunPub</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
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
                <span className="text-base">{platform.icon}</span>
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
          <div className="w-8 h-8 rounded-full bg-brand-gradient-subtle border-2 border-brand"></div>
        </div>
      </div>
    </header>
  );
}