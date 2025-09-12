import { Platform, Page } from '../WunPubLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Inbox, 
  Rss, 
  PenTool, 
  Calendar, 
  FileText,
  Bell
} from 'lucide-react';

interface SideNavigationProps {
  selectedPage: Page;
  onPageChange: (page: Page) => void;
  selectedPlatform: Platform;
}

const navigationItems = [
  { id: 'home' as Page, name: 'Home', icon: Home, badge: null },
  { id: 'inbox' as Page, name: 'Inbox', icon: Inbox, badge: 12 },
  { id: 'feed' as Page, name: 'Feed', icon: Rss, badge: 5 },
  { id: 'post' as Page, name: 'Post', icon: PenTool, badge: null },
  { id: 'calendar' as Page, name: 'Calendar', icon: Calendar, badge: null },
  { id: 'templates' as Page, name: 'Templates', icon: FileText, badge: null }
];

export function SideNavigation({ selectedPage, onPageChange, selectedPlatform }: SideNavigationProps) {
  return (
    <aside className="w-64 bg-surface-1 border-r border-border h-[calc(100vh-73px)]">
      <div className="p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={selectedPage === item.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(item.id)}
              className={`
                w-full justify-start h-11 px-4 transition-all duration-200
                ${selectedPage === item.id 
                  ? 'bg-brand text-brand-foreground shadow-wun-sm font-medium' 
                  : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={`
                    ml-2 h-5 px-2 text-xs
                    ${selectedPage === item.id 
                      ? 'bg-brand-foreground/20 text-brand-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Platform: {selectedPlatform}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Posts this month</span>
              <span className="font-medium text-foreground">7/10</span>
            </div>
            
            <div className="w-full bg-surface-2 rounded-full h-2">
              <div className="bg-brand h-2 rounded-full w-[70%] transition-all duration-300"></div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-brand text-brand hover:bg-brand hover:text-brand-foreground transition-colors duration-200"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}