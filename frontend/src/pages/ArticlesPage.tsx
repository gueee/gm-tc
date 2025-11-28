import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { getContent, getCategories, BlogPost, Category } from '../services/blog'

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    pages: 1,
  })

  const currentCategory = searchParams.get('category') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [contentData, categoriesData] = await Promise.all([
          getContent({
            page: currentPage,
            limit: pagination.limit,
            category: currentCategory || undefined,
          }),
          getCategories(),
        ])

        setArticles(contentData.items)
        setPagination({
          total: contentData.total,
          page: contentData.page,
          limit: contentData.limit,
          pages: contentData.pages,
        })
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [currentCategory, currentPage, pagination.limit])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    setSearchParams(params)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    setSearchParams(params)
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-gradient">Articles</span>
          </h1>
          <p className="text-steel-400 max-w-2xl">
            Deep dives into 3D printing, programming, electronics, and more.
            Explore tutorials, analyses, and insights from my projects.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-steel-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-copper-400 text-steel-900'
                  : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-copper-400 text-steel-900'
                    : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-steel-400 text-lg">No articles found.</p>
            {currentCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="mt-4 text-copper-400 hover:text-copper-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="group bg-steel-800/50 border border-steel-700 rounded-xl overflow-hidden card-hover"
                >
                  <div className="p-6">
                    {article.category && (
                      <span className="inline-block px-3 py-1 bg-copper-400/10 text-copper-400 text-xs font-medium rounded-full mb-4">
                        {article.category.name}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-copper-400 transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-steel-400 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
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
                  <div className="h-0.5 bg-gradient-to-r from-copper-400 to-copper-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-steel-800 text-steel-300 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-copper-400 text-steel-900'
                        : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="p-2 rounded-lg bg-steel-800 text-steel-300 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

