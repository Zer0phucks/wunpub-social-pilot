import { createContext, useContext } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as sharedClient } from './client';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseContext.Provider value={sharedClient}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
