import { useEffect, useState } from 'react'
import { getHeroContent, HeroContent } from '../../services/homepage'

// Default content as fallback
const defaultHero: HeroContent = {
  headline: "I Just Kept Doing What I Loved",
  tagline: "The universe took care of the rest.",
  subtitle: "CAD Engineering • Klipper Development • Cutting-Edge 3D Printers"
}

export default function HeroSection() {
  const [hero, setHero] = useState<HeroContent>(defaultHero)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHero() {
      try {
        const data = await getHeroContent()
        setHero(data)
      } catch (error) {
        console.error('Failed to fetch hero content:', error)
        // Keep default content
      } finally {
        setIsLoading(false)
      }
    }
    fetchHero()
  }, [])

  const badges = ['Maker', 'Engineer', 'Innovator']

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-steel-900 via-steel-800 to-steel-900" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, #D4A574 1px, transparent 1px),
                           linear-gradient(to bottom, #D4A574 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
            {badges.map((badge, index) => (
              <span
                key={badge}
                className={`px-4 py-1.5 bg-steel-800/50 border border-steel-700 rounded-full text-sm text-steel-300 delay-${(index + 1) * 100}`}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in delay-200 ${isLoading ? 'opacity-50' : ''}`}
          >
            <span className="text-white">{hero.headline.split(' ').slice(0, -2).join(' ')} </span>
            <span className="text-gradient">{hero.headline.split(' ').slice(-2).join(' ')}</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-steel-400 mb-4 animate-fade-in delay-300">
            {hero.tagline}
          </p>

          {/* Subtitle */}
          <p className="text-lg text-copper-400 font-medium animate-fade-in delay-400">
            {hero.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
