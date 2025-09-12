import { WunPubLayout } from '@/components/WunPubLayout';
import { HomePage } from '@/components/dashboard/HomePage';
import { PostCreator } from '@/components/posts/PostCreator';
import { PostsList } from '@/components/posts/PostsList';

interface IndexProps {
  selectedPage?: string;
  selectedPlatform?: string;
  selectedProjectId?: string;
}

const Index = () => {
  return (
    <WunPubLayout>
      <MainContent />
    </WunPubLayout>
  );
};

const MainContent = ({ selectedPage, selectedProjectId }: IndexProps) => {
  switch (selectedPage) {
    case 'post':
      return <PostCreator />;
    case 'feed':
      return <PostsList selectedProjectId={selectedProjectId} />;
    case 'inbox':
      return <div>Inbox coming soon...</div>;
    case 'calendar':
      return <div>Calendar coming soon...</div>;
    case 'templates':
      return <div>Templates coming soon...</div>;
    default:
      return <HomePage />;
  }
};

export default Index;