import { useEffect, useState } from 'react';
import { homepageService } from '@/services/homepage';

interface HeroContent {
  headline: string;
  tagline: string;
  subtitle: string;
}

const defaultHero: HeroContent = {
  headline: 'I Just Kept Doing What I Loved',
  tagline: 'The universe took care of the rest.',
  subtitle: 'CAD Engineering • Klipper Development • Cutting-Edge 3D Printers • Manufacturing',
};

export function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHero);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const content = await homepageService.get('hero');
        if (content.content) {
          setHeroContent({
            headline: content.content.headline || defaultHero.headline,
            tagline: content.content.tagline || defaultHero.tagline,
            subtitle: content.content.subtitle || defaultHero.subtitle,
          });
        }
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
        // Use default content on error
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-steel-900 via-steel-800 to-steel-900 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-copper-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          {!loading && (
            <>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-copper-200 to-copper-400 bg-clip-text text-transparent">
                {heroContent.headline}
              </h1>
              <p className="text-xl md:text-2xl text-steel-300 mb-8 leading-relaxed">
                {heroContent.tagline}
                <br />
                <span className="text-lg text-steel-400 mt-4 block">
                  {heroContent.subtitle}
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-12">
                <div className="px-6 py-3 bg-steel-700/50 backdrop-blur-sm border border-steel-600 rounded-lg hover-glow">
                  <span className="text-copper-300 font-semibold">Maker</span>
                </div>
                <div className="px-6 py-3 bg-steel-700/50 backdrop-blur-sm border border-steel-600 rounded-lg hover-glow">
                  <span className="text-copper-300 font-semibold">Engineer</span>
                </div>
                <div className="px-6 py-3 bg-steel-700/50 backdrop-blur-sm border border-steel-600 rounded-lg hover-glow">
                  <span className="text-copper-300 font-semibold">Innovator</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

