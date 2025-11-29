import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, Filter } from 'lucide-react'
import { getAdminContent, getCategories, deleteContent, BlogPost, Category } from '../../services/blog'

type StatusFilter = 'all' | 'published' | 'draft'

export default function ArticleList() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        getAdminContent({ limit: 100 }),
        getCategories(false),
      ])
      setArticles(articlesData.items)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteContent(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete article:', error)
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || article.category_id === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="text-steel-400">{articles.length} total articles</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-steel-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Table */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-steel-400 mb-4">No articles found</p>
            <Link
              to="/admin/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copper-400/10 text-copper-400 rounded-lg hover:bg-copper-400/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-steel-700">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-steel-300">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-steel-300 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-steel-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-steel-300 hidden lg:table-cell">
                    Views
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-steel-300 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-steel-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-700">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-steel-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{article.title}</p>
                        <p className="text-sm text-steel-500 truncate max-w-xs">{article.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-steel-700 text-steel-300">
                        {article.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          article.status === 'published'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-steel-400">{article.view_count}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-steel-400 text-sm">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/article/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}`)}
                          className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === article.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-steel-700 text-steel-300 rounded hover:bg-steel-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(article.id)}
                            className="p-2 text-steel-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

