import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Eye, Tag, ChevronRight } from 'lucide-react'
import { getContent, getCategories, BlogPost, Category } from '../services/blog'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams] = useSearchParams()

  const selectedCategory = searchParams.get('category')

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesResponse, categoriesData] = await Promise.all([
          getContent({ limit: 100 }),
          getCategories()
        ])
        setArticles(articlesResponse.items)
        setCategories(categoriesData)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Filter articles by category if selected
  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category?.slug === selectedCategory)
    : articles

  // Only show published articles
  const publishedArticles = filteredArticles.filter(a => a.status === 'published')

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {selectedCategory
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Articles'
              : 'All Articles'
            }
          </h1>
          <p className="text-steel-400 text-lg">
            Technical articles, experiments, and insights
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              to="/articles"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-copper-400 text-steel-900'
                  : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
              }`}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/articles?category=${category.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-copper-400 text-steel-900'
                    : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {publishedArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-steel-400 text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group bg-steel-800/50 border border-steel-700 rounded-xl overflow-hidden hover:border-copper-400/50 transition-all"
              >
                {/* Thumbnail placeholder */}
                <div className="aspect-video bg-gradient-to-br from-steel-700 to-steel-800 flex items-center justify-center">
                  <span className="text-4xl text-steel-600">📝</span>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category */}
                  {article.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-copper-400/10 text-copper-400 text-xs font-medium rounded-full mb-3">
                      <Tag className="w-3 h-3" />
                      {article.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-copper-400 transition-colors line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-steel-400 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-steel-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.view_count}
                    </span>
                  </div>
                </div>

                {/* Read more indicator */}
                <div className="px-5 pb-4">
                  <span className="inline-flex items-center gap-1 text-sm text-copper-400 group-hover:gap-2 transition-all">
                    Read more
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
