-- Add OAuth state tracking table for social media connections
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_token text NOT NULL UNIQUE,
  user_id text NOT NULL,
  project_id uuid NOT NULL,
  platform text NOT NULL,
  redirect_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policies for oauth_states
CREATE POLICY "Users can manage their own oauth states" 
ON public.oauth_states 
FOR ALL 
USING (user_id = (auth.jwt() ->> 'sub'::text));

-- Create index for cleanup
CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- Add cleanup function for expired states
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.oauth_states 
  WHERE expires_at < now();
END;
$$;