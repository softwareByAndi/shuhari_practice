import { SessionProvider } from '@/contexts/SessionProvider';
import PracticeContentFixed from './PracticeContentFixed';

export default function PracticePage() {
  return (
    <SessionProvider>
      <PracticeContentFixed />
    </SessionProvider>
  );
}