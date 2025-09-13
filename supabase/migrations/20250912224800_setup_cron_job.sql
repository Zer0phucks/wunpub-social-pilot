-- Create a function to check for and publish scheduled posts
CREATE OR REPLACE FUNCTION public.run_scheduled_posts()
RETURNS VOID AS $$
DECLARE
  post_to_publish RECORD;
BEGIN
  FOR post_to_publish IN
    SELECT id FROM public.posts
    WHERE status = 'scheduled' AND scheduled_at <= now()
  LOOP
    -- Call the publish_post function for each due post
    PERFORM public.publish_post(post_to_publish.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run every minute
SELECT cron.schedule('run-scheduled-posts', '* * * * *', 'SELECT public.run_scheduled_posts()');
