import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/integrations/supabase/SupabaseProvider";
import { toast } from "sonner";
import { useSecurityAudit, createSecurityEvent } from "@/hooks/useSecurityAudit";

// Rate limiting store (in production, use Redis or database)
const attemptStore = new Map<string, { count: number; lastAttempt: number }>();

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one letter and one number" };
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  return { isValid: true };
};

const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const key = email.toLowerCase();
  const attempt = attemptStore.get(key);
  
  if (!attempt) {
    attemptStore.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset count if last attempt was more than 15 minutes ago
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    attemptStore.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Allow up to 5 attempts per 15 minutes
  if (attempt.count >= 5) {
    return false;
  }
  
  attemptStore.set(key, { count: attempt.count + 1, lastAttempt: now });
  return true;
};

const Auth = () => {
  const supabase = useSupabase();
  const { logSecurityEvent } = useSecurityAudit();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<string | null>(null);

  // Password validation on change
  useEffect(() => {
    if (isSignUp && password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation.isValid ? null : validation.message || null);
    } else {
      setPasswordValidation(null);
    }
  }, [password, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Log auth attempt
      logSecurityEvent(createSecurityEvent.authAttempt(email));
      
      // Rate limiting check
      if (!checkRateLimit(email)) {
        logSecurityEvent(createSecurityEvent.rateLimitExceeded(email));
        throw new Error("Too many attempts. Please try again in 15 minutes.");
      }
      
      // Password validation for signup
      if (isSignUp) {
        const validation = validatePassword(password);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (signUpError) throw signUpError;
        logSecurityEvent(createSecurityEvent.authSuccess(email));
        toast.success("Check your email to confirm your account!");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        logSecurityEvent(createSecurityEvent.authSuccess(email));
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      const errorMessage = err?.message ?? "Authentication failed";
      logSecurityEvent(createSecurityEvent.authFailure(email, errorMessage));
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            WunPub
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              {passwordValidation && (
                <p className="text-xs text-red-500">{passwordValidation}</p>
              )}
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Must be 8+ characters with letters, numbers, and special characters
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign up" : "Sign in")}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;