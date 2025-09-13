import { createRoot } from "react-dom/client";
import { SupabaseProvider } from "@/integrations/supabase/SupabaseProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <SupabaseProvider>
    <App />
  </SupabaseProvider>
);
