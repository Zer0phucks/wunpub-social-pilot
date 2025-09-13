import { useEffect } from 'react';
import { WunPubLayout } from '@/components/WunPubLayout';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Twitter, Linkedin } from 'lucide-react';
import { useSupabase } from '@/integrations/supabase/SupabaseProvider';
import { useUser } from '@/hooks/useUser';

const Settings = () => {
  const { projects } = useProjects();
  const selectedProjectId = projects[0]?.id;
  const { socialAccounts, isLoading, connectAccount, deleteAccount, createAccount } = useSocialAccounts(selectedProjectId);
  const supabase = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        const provider = session.user.app_metadata.provider;
        createAccount({
          user_id: user.id,
          project_id: selectedProjectId,
          platform: provider,
          username: session.user.user_metadata.user_name,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, user, selectedProjectId, createAccount]);

  return (
    <WunPubLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and project settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Twitter className="w-6 h-6" />
                <span>Connect your Twitter account</span>
              </div>
              <Button onClick={() => connectAccount('twitter')}>Connect</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Linkedin className="w-6 h-6" />
                <span>Connect your LinkedIn account</span>
              </div>
              <Button onClick={() => connectAccount('linkedin')}>Connect</Button>
            </div>

            {isLoading && <p>Loading accounts...</p>}

            {socialAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-.lg">
                <div className="flex items-center space-x-4">
                  {account.platform === 'twitter' && <Twitter className="w-6 h-6" />}
                  {account.platform === 'linkedin' && <Linkedin className="w-6 h-6" />}
                  <span>{account.username}</span>
                </div>
                <Button variant="destructive" onClick={() => deleteAccount(account.id)}>Disconnect</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </WunPubLayout>
  );
};

export default Settings;
