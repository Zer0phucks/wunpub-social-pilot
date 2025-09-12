import { WunPubLayout } from '@/components/WunPubLayout';
import { HomePage } from '@/components/dashboard/HomePage';
import { PostCreator } from '@/components/posts/PostCreator';
import { PostsList } from '@/components/posts/PostsList';
import { Inbox } from '@/components/inbox/Inbox';
import { ContentCalendar } from '@/components/calendar/ContentCalendar';

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
      return <Inbox selectedProjectId={selectedProjectId} />;
    case 'calendar':
      return <ContentCalendar selectedProjectId={selectedProjectId} />;
    case 'templates':
      return <div>Templates coming soon...</div>;
    default:
      return <HomePage />;
  }
};

export default Index;