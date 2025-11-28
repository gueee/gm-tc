import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye } from 'lucide-react'
import { getContent, getCategoryBySlug, BlogPost, Category } from '../services/blog'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!slug) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch category info and articles in parallel
        const [categoryData, contentData] = await Promise.all([
          getCategoryBySlug(slug),
          getContent({ category: slug, limit: 50 }),
        ])

        setCategory(categoryData)
        setArticles(contentData.items)
      } catch (err) {
        console.error('Failed to fetch category:', err)
        setError('Category not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
        <p className="text-steel-400 mb-8">The category you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-copper-400 hover:text-copper-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-steel-400 hover:text-copper-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Category Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-gradient">{category.name}</span>
          </h1>
          {category.description && (
            <p className="text-xl text-steel-400 max-w-3xl">
              {category.description}
            </p>
          )}
        </header>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-steel-800/50 rounded-xl border border-steel-700">
            <p className="text-steel-400 text-lg mb-4">No articles in this category yet.</p>
            <p className="text-steel-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group bg-steel-800/50 border border-steel-700 rounded-xl overflow-hidden card-hover"
              >
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-copper-400 transition-colors line-clamp-2">
                    {article.title}
                  </h2>

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
        )}
      </div>
    </div>
  )
}


