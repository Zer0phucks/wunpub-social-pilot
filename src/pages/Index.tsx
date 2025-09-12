import { WunPubLayout } from '@/components/WunPubLayout';
import { HomePage } from '@/components/dashboard/HomePage';
import { PostCreator } from '@/components/posts/PostCreator';

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

const MainContent = ({ selectedPage }: IndexProps) => {
  switch (selectedPage) {
    case 'post':
      return <PostCreator />;
    case 'inbox':
      return <div>Inbox coming soon...</div>;
    case 'feed':
      return <div>Feed coming soon...</div>;
    case 'calendar':
      return <div>Calendar coming soon...</div>;
    case 'templates':
      return <div>Templates coming soon...</div>;
    default:
      return <HomePage />;
  }
};

export default Index;