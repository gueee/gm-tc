import { HeroSection } from '@/components/HomePage/HeroSection';
import { InterestsShowcase } from '@/components/HomePage/InterestsShowcase';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <InterestsShowcase />
    </div>
  );
}

