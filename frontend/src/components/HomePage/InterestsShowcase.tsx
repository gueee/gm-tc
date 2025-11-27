import { useEffect, useState } from 'react';
import {
  Cpu,
  Printer,
  Code,
  Zap,
  Bike,
  Brain,
  Wrench,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { homepageService } from '@/services/homepage';

interface Interest {
  icon: string;
  title: string;
  description: string;
}

const iconMap: Record<string, LucideIcon> = {
  Printer,
  Code,
  Cpu,
  Zap,
  Bike,
  Brain,
  Wrench,
  Sparkles,
};

const defaultInterests: Interest[] = [
  {
    icon: 'Printer',
    title: '3D Printing',
    description: 'Design and manufacturing with precision',
  },
  {
    icon: 'Code',
    title: 'Programming',
    description: 'Building solutions through code',
  },
  {
    icon: 'Cpu',
    title: 'Electronics',
    description: 'Microcontrollers and circuit design',
  },
  {
    icon: 'Zap',
    title: 'FPV Drones',
    description: 'High-speed aerial innovation',
  },
  {
    icon: 'Bike',
    title: 'Motorcycles',
    description: 'Engineering meets adventure',
  },
  {
    icon: 'Brain',
    title: 'AI Development',
    description: 'Exploring intelligent systems',
  },
  {
    icon: 'Wrench',
    title: 'CNC Machining',
    description: 'Precision manufacturing',
  },
  {
    icon: 'Sparkles',
    title: 'Laser Engraving',
    description: 'Art meets technology',
  },
];

export function InterestsShowcase() {
  const [interests, setInterests] = useState<Interest[]>(defaultInterests);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const content = await homepageService.get('interests');
        if (content.content?.interests && Array.isArray(content.content.interests)) {
          setInterests(content.content.interests);
        }
      } catch (error) {
        console.error('Failed to fetch interests:', error);
        // Use default interests on error
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-steel-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-steel-300">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-steel-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Drives Me
          </h2>
          <p className="text-xl text-steel-300 max-w-2xl mx-auto">
            From CAD design to AI development, I've turned my passions into my profession.
            Every project is a chance to push boundaries and create something extraordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interests.map((interest, index) => {
            const IconComponent = iconMap[interest.icon] || Code;
            return (
              <div
                key={index}
                className="group p-6 bg-steel-800 rounded-lg border border-steel-700 hover:border-copper-500 transition-all duration-300 hover:shadow-lg hover-glow"
              >
                <div className="text-copper-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {interest.title}
                </h3>
                <p className="text-steel-300 text-sm">
                  {interest.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

