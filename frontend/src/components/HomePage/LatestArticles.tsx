import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Eye } from 'lucide-react'
import { getContent, BlogPost } from '../../services/blog'

export default function LatestArticles() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await getContent({ limit: 3 })
        setArticles(data.items)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400 mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Latest <span className="text-gradient">Articles</span>
            </h2>
            <p className="text-steel-400">
              Deep dives, tutorials, and insights from my projects.
            </p>
          </div>
          <Link
            to="/articles"
            className="hidden sm:flex items-center gap-2 text-copper-400 hover:text-copper-300 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="group bg-steel-800/50 border border-steel-700 rounded-xl overflow-hidden card-hover"
            >
              {/* Article Content */}
              <div className="p-6">
                {/* Category Badge */}
                {article.category && (
                  <span className="inline-block px-3 py-1 bg-copper-400/10 text-copper-400 text-xs font-medium rounded-full mb-4">
                    {article.category.name}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-copper-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-steel-400 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-steel-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.view_count} views
                  </span>
                </div>
              </div>

              {/* Hover accent */}
              <div className="h-0.5 bg-gradient-to-r from-copper-400 to-copper-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-copper-400 hover:text-copper-300 transition-colors"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
