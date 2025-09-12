import { useState } from 'react';
import { TopNavigation } from './navigation/TopNavigation';
import { SideNavigation } from './navigation/SideNavigation';

export type Platform = 'ALL' | 'REDDIT' | 'TWITTER' | 'FACEBOOK' | 'LINKEDIN';
export type Page = 'home' | 'inbox' | 'feed' | 'post' | 'calendar' | 'templates';

interface WunPubLayoutProps {
  children: React.ReactNode;
}

export function WunPubLayout({ children }: WunPubLayoutProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('ALL');
  const [selectedPage, setSelectedPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation 
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
      />
      
      <div className="flex">
        <SideNavigation 
          selectedPage={selectedPage}
          onPageChange={setSelectedPage}
          selectedPlatform={selectedPlatform}
        />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}