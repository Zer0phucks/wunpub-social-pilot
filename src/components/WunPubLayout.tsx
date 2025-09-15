import { useState, useEffect } from 'react';
import * as React from 'react';
import { TopNavigation } from './navigation/TopNavigation';
import { SideNavigation } from './navigation/SideNavigation';
import { ProjectSetup } from './onboarding/ProjectSetup';
import { ProjectSelector } from './projects/ProjectSelector';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';

export type Platform = 'ALL' | 'REDDIT' | 'TWITTER' | 'FACEBOOK' | 'LINKEDIN';
export type Page = 'home' | 'inbox' | 'feed' | 'post' | 'calendar' | 'templates';

interface WunPubLayoutProps {
  children: React.ReactNode;
}

export function WunPubLayout({ children }: WunPubLayoutProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('ALL');
  const [selectedPage, setSelectedPage] = useState<Page>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectSetup, setShowProjectSetup] = useState(false);

  const { isLoading: isUserLoading } = useUser();
  const { projects, isLoading: isProjectsLoading } = useProjects();

  // Restore last selected project from localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('wunpub:selectedProjectId') : null;
    if (saved && !selectedProjectId) {
      setSelectedProjectId(saved);
    }
  }, []);

  // Persist selected project
  useEffect(() => {
    if (selectedProjectId && typeof window !== 'undefined') {
      window.localStorage.setItem('wunpub:selectedProjectId', selectedProjectId);
    }
  }, [selectedProjectId]);

  // Auto-select first project or show/hide setup appropriately
  useEffect(() => {
    if (isProjectsLoading) return;

    if (projects.length > 0) {
      const exists = selectedProjectId && projects.some(p => p.id === selectedProjectId);
      if (!selectedProjectId || !exists) {
        setSelectedProjectId(projects[0].id);
      }
      if (showProjectSetup) {
        setShowProjectSetup(false);
      }
    } else {
      if (!showProjectSetup) {
        setShowProjectSetup(true);
      }
    }
  }, [isProjectsLoading, projects, projects.length, selectedProjectId, showProjectSetup]);

  // Show loading while user data loads
  if (isUserLoading || isProjectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">W</span>
          </div>
          <p className="text-muted-foreground">Loading WunPub...</p>
        </div>
      </div>
    );
  }

  // Show project setup for new users
  if (showProjectSetup) {
    return (
      <ProjectSetup 
        onComplete={(projectId) => {
          setSelectedProjectId(projectId);
          setShowProjectSetup(false);
        }} 
      />
    );
  }

  // Show project selector if no project is selected
  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigation 
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
        />
        <div className="p-6">
          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
            onCreateNew={() => setShowProjectSetup(true)}
          />
        </div>
      </div>
    );
  }

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
          {React.cloneElement(children as React.ReactElement, { 
            selectedPage,
            selectedPlatform,
            selectedProjectId 
          })}
        </main>
      </div>
    </div>
  );
}
