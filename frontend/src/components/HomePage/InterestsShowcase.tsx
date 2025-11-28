import { useEffect, useState } from 'react'
import {
  Printer, Code, Cpu, Zap, Bike, Brain, Wrench, Sparkles,
  LucideIcon
} from 'lucide-react'
import { getInterestsContent, InterestItem } from '../../services/homepage'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Printer,
  Code,
  Cpu,
  Zap,
  Bike,
  Brain,
  Wrench,
  Sparkles,
}

// Default interests as fallback
const defaultInterests: InterestItem[] = [
  { icon: 'Printer', title: '3D Printing', description: 'Perfect prints. Not the doormat kind.' },
  { icon: 'Code', title: 'Programming', description: 'Code that actually works. Shocking, I know.' },
  { icon: 'Cpu', title: 'Electronics', description: 'Circuits smart enough to keep up with me.' },
  { icon: 'Zap', title: 'FPV Drones', description: 'Flying machines with zero input lag.' },
  { icon: 'Brain', title: 'AI Development', description: 'Teaching algorithms to outthink the average person.' },
  { icon: 'Wrench', title: 'CNC Machining', description: 'Tolerances that make machinists jealous.' },
  { icon: 'Sparkles', title: 'Laser Engraving', description: 'Carving precision into existence.' },
  { icon: 'Bike', title: 'Motorcycles', description: 'The antidote to the grind.' },
]

export default function InterestsShowcase() {
  const [interests, setInterests] = useState<InterestItem[]>(defaultInterests)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInterests() {
      try {
        const data = await getInterestsContent()
        if (data.interests && data.interests.length > 0) {
          setInterests(data.interests)
        }
      } catch (error) {
        console.error('Failed to fetch interests:', error)
        // Keep default interests
      } finally {
        setIsLoading(false)
      }
    }
    fetchInterests()
  }, [])

  return (
    <section id="interests" className="bg-steel-800/50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What I <span className="text-gradient">Build & Create</span>
          </h2>
          <p className="text-steel-400 max-w-2xl mx-auto">
            From precision engineering to creative coding, these are the domains where I spend my time.
          </p>
        </div>

        {/* Interests Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${isLoading ? 'opacity-50' : ''}`}>
          {interests.map((interest, index) => {
            const Icon = iconMap[interest.icon] || Sparkles

            return (
              <div
                key={interest.title}
                className="group relative bg-steel-900 border border-steel-700 rounded-xl p-6 card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-copper-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-copper-400/20 transition-colors">
                  <Icon className="w-6 h-6 text-copper-400" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-copper-400 transition-colors">
                  {interest.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-steel-400">
                  {interest.description}
                </p>

                {/* Hover accent */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-copper-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
