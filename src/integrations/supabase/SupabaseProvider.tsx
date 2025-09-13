import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { Database } from './types';

const SupabaseContext = createContext<SupabaseClient | null>(null);

const SUPABASE_URL = 'https://ibyfykxexycghrjgrowe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieWZ5a3hleHljZ2hyamdyb3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MDYsImV4cCI6MjA3MzI1MzcwNn0.2rcYM1Ojp9jbwAOufTB0OFGa0w_hhyxyHtUZ8EICHmI';

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        let authToken = null;
        if (getToken) {
          // Get the Clerk token with the Supabase template
          authToken = await getToken({ template: 'supabase' });
        }

        const client = createClient<Database>(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          authToken ? {
            global: {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
            auth: {
              persistSession: false,
            },
          } : {
            auth: {
              persistSession: false,
            },
          }
        );
        setSupabase(client);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        // Create client without auth if there's an error
        const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: false,
          },
        });
        setSupabase(client);
      }
    };

    initSupabase();
  }, [getToken]);

  // Don't render children until supabase client is ready
  if (!supabase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">W</span>
          </div>
          <p className="text-muted-foreground">Connecting to WunPub...</p>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={supabase}>
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