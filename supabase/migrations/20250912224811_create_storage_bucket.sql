-- Create a bucket for post media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload to post-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media' AND owner = auth.uid());

CREATE POLICY "Users can view their own media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'post-media' AND owner = auth.uid());

CREATE POLICY "Users can delete their own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-media' AND owner = auth.uid());
