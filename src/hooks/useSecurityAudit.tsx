import { useMutation } from '@tanstack/react-query';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';

export interface SecurityEvent {
  event_type: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'token_access' | 'account_connection' | 'suspicious_activity';
  details: {
    email?: string;
    ip_address?: string;
    user_agent?: string;
    platform?: string;
    account_id?: string;
    error_message?: string;
    [key: string]: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecurityAudit = () => {
  const supabase = useSupabase();

  const logSecurityEvent = useMutation({
    mutationFn: async (event: SecurityEvent) => {
      // Get client info
      const clientInfo = {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...event.details
      };

      // Log to console for development
      console.log(`[SECURITY AUDIT] ${event.event_type}:`, {
        severity: event.severity,
        ...clientInfo
      });

      // In production, this would send to a security monitoring service
      // For now, we'll store basic info in browser storage for demo
      const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      securityLogs.push({
        timestamp: new Date().toISOString(),
        event_type: event.event_type,
        severity: event.severity,
        details: clientInfo
      });
      
      // Keep only last 100 events
      if (securityLogs.length > 100) {
        securityLogs.splice(0, securityLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(securityLogs));

      return { success: true };
    },
  });

  return {
    logSecurityEvent: logSecurityEvent.mutate,
    isLogging: logSecurityEvent.isPending,
  };
};

// Helper functions for common security events
export const createSecurityEvent = {
  authAttempt: (email: string): SecurityEvent => ({
    event_type: 'auth_attempt',
    details: { email },
    severity: 'low'
  }),

  authSuccess: (email: string): SecurityEvent => ({
    event_type: 'auth_success', 
    details: { email },
    severity: 'low'
  }),

  authFailure: (email: string, error: string): SecurityEvent => ({
    event_type: 'auth_failure',
    details: { email, error_message: error },
    severity: 'medium'
  }),

  tokenAccess: (platform: string, accountId: string): SecurityEvent => ({
    event_type: 'token_access',
    details: { platform, account_id: accountId },
    severity: 'medium'
  }),

  accountConnection: (platform: string, accountId: string): SecurityEvent => ({
    event_type: 'account_connection',
    details: { platform, account_id: accountId },
    severity: 'low'
  }),

  rateLimitExceeded: (email: string): SecurityEvent => ({
    event_type: 'suspicious_activity',
    details: { email, activity_type: 'rate_limit_exceeded' },
    severity: 'high'
  })
};
