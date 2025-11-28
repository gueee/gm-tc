import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Printer, Code, Cpu, Zap, Bike, Brain, Wrench, Sparkles, Plane, Cog,
  LucideIcon
} from 'lucide-react'
import { getCategories, Category } from '../../services/blog'

// Icon mapping - matches category icons from database
const iconMap: Record<string, LucideIcon> = {
  Printer,
  Code,
  Cpu,
  Zap,
  Bike,
  Brain,
  Wrench,
  Sparkles,
  Plane,
  Cog,
}

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories(true) // Only active categories
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <section id="categories" className="bg-steel-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400 mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section id="categories" className="bg-steel-800/50 py-20">
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

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon || ''] || Sparkles

            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group relative bg-steel-900 border border-steel-700 rounded-xl p-6 card-hover block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-copper-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-copper-400/20 transition-colors">
                  <Icon className="w-6 h-6 text-copper-400" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-copper-400 transition-colors">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-steel-400">
                  {category.description}
                </p>

                {/* Hover accent */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-copper-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}



