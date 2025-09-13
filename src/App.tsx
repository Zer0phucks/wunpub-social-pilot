import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useEffect } from "react";
import { SupabaseProvider } from "@/integrations/supabase/SupabaseProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <SignedIn>
                    <Index />
                  </SignedIn>
                  <SignedOut>
                    <Auth />
                  </SignedOut>
                </>
              } 
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseProvider>
  </QueryClientProvider>
);
};

export default App;
