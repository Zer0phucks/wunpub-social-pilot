import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { Database } from './types';

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | undefined>(
    undefined
  );

  useEffect(() => {
    if (getToken) {
      const client = createClient<Database>(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${getToken({ template: 'supabase' })}`,
            },
          },
        }
      );
      setSupabase(client);
    }
  }, [getToken]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};