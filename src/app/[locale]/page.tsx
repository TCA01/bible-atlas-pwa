import { Header } from '@/components/layout/Header';
import { BibleReader } from '@/components/reader/BibleReader';
import { TypographyDrawer } from '@/components/reader/TypographyDrawer';
import { MapPanel } from '@/components/map/MapPanel';
import { StudyDrawer } from '@/components/study/StudyDrawer';

export default function ReaderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TypographyDrawer />
      <StudyDrawer />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <BibleReader />
        </div>
        <MapPanel />
      </main>
    </div>
  );
}
