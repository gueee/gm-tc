import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FolderOpen, Eye, Plus } from 'lucide-react'
import { getContent, getCategories, BlogPost } from '../../services/blog'

interface Stats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalCategories: number
  totalViews: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentArticles, setRecentArticles] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          getContent({ limit: 100 }),
          getCategories(false),
        ])

        const articles = articlesData.items
        const published = articles.filter(a => a.status === 'published')
        const drafts = articles.filter(a => a.status === 'draft')
        const totalViews = articles.reduce((sum, a) => sum + a.view_count, 0)

        setStats({
          totalArticles: articles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalCategories: categoriesData.length,
          totalViews,
        })

        setRecentArticles(articles.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-steel-400">Welcome to your CMS</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          label="Total Articles"
          value={stats?.totalArticles || 0}
          subtext={`${stats?.publishedArticles || 0} published, ${stats?.draftArticles || 0} drafts`}
        />
        <StatCard
          icon={FolderOpen}
          label="Categories"
          value={stats?.totalCategories || 0}
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={stats?.totalViews || 0}
        />
        <StatCard
          icon={FileText}
          label="Published"
          value={stats?.publishedArticles || 0}
          highlight
        />
      </div>

      {/* Recent Articles */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Articles</h2>
          <Link
            to="/admin/articles"
            className="text-sm text-copper-400 hover:text-copper-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <div className="p-6 text-center text-steel-400">
            No articles yet. Create your first article!
          </div>
        ) : (
          <div className="divide-y divide-steel-700">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                to={`/admin/articles/${article.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-steel-700/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-white">{article.title}</h3>
                  <p className="text-sm text-steel-400">
                    {article.category?.name || 'Uncategorized'} • {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  article.status === 'published'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {article.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          to="/admin/articles/new"
          icon={FileText}
          label="Create Article"
          description="Write a new blog post or tutorial"
        />
        <QuickAction
          to="/admin/categories"
          icon={FolderOpen}
          label="Manage Categories"
          description="Organize your content"
        />
        <QuickAction
          to="/admin/settings"
          icon={Eye}
          label="Site Settings"
          description="Update hero and homepage"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  highlight
}: {
  icon: typeof FileText
  label: string
  value: number
  subtext?: string
  highlight?: boolean
}) {
  return (
    <div className={`p-6 rounded-xl border ${
      highlight
        ? 'bg-copper-400/10 border-copper-400/30'
        : 'bg-steel-800 border-steel-700'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-copper-400/20' : 'bg-steel-700'}`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-copper-400' : 'text-steel-400'}`} />
        </div>
        <span className="text-sm font-medium text-steel-400">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-copper-400' : 'text-white'}`}>
        {value.toLocaleString()}
      </p>
      {subtext && (
        <p className="text-xs text-steel-500 mt-1">{subtext}</p>
      )}
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
  description,
}: {
  to: string
  icon: typeof FileText
  label: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-steel-800 border border-steel-700 rounded-xl hover:border-copper-400/50 transition-colors group"
    >
      <div className="p-3 bg-steel-700 rounded-lg group-hover:bg-copper-400/10 transition-colors">
        <Icon className="w-6 h-6 text-steel-400 group-hover:text-copper-400 transition-colors" />
      </div>
      <div>
        <h3 className="font-medium text-white group-hover:text-copper-400 transition-colors">{label}</h3>
        <p className="text-sm text-steel-500">{description}</p>
      </div>
    </Link>
  )
}

