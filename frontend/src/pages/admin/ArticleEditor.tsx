import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw, Eye, AlertCircle, CheckCircle } from 'lucide-react'
import { BlockEditor, Block } from '../../components/admin/blocks'
import { getContentById, createContent, updateContent, getCategories, Category } from '../../services/blog'

interface ArticleData {
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  category_id: number | undefined
  content: string
  blocks: Block[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [autoSlug, setAutoSlug] = useState(isNew)

  const [article, setArticle] = useState<ArticleData>({
    title: '',
    slug: '',
    excerpt: '',
    status: 'draft',
    category_id: undefined,
    content: '',
    blocks: [],
  })

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      const categoriesData = await getCategories(false)
      setCategories(categoriesData)

      if (!isNew && id) {
        setIsLoading(true)
        const data = await getContentById(Number(id))
        // Handle blocks - could be null, undefined, empty object {}, or actual array
        let parsedBlocks: Block[] = []
        if (data.blocks && Array.isArray(data.blocks)) {
          parsedBlocks = data.blocks as unknown as Block[]
        } else if (data.blocks && typeof data.blocks === 'object' && 'blocks' in data.blocks) {
          // Handle case where blocks is wrapped: { blocks: [...] }
          parsedBlocks = (data.blocks as { blocks: Block[] }).blocks || []
        }

        setArticle({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          status: data.status as 'draft' | 'published',
          category_id: data.category_id,
          content: data.content || '',
          blocks: parsedBlocks,
        })
        setAutoSlug(false)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setMessage({ type: 'error', text: 'Failed to load article' })
    } finally {
      setIsLoading(false)
    }
  }

  function handleTitleChange(title: string) {
    setArticle((prev) => ({
      ...prev,
      title,
      slug: autoSlug ? slugify(title) : prev.slug,
    }))
  }

  function handleSlugChange(slug: string) {
    setAutoSlug(false)
    setArticle((prev) => ({ ...prev, slug: slugify(slug) }))
  }

  async function handleSave() {
    if (!article.title.trim() || !article.slug.trim()) {
      setMessage({ type: 'error', text: 'Title and slug are required' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // Build payload, only include category_id if it's a valid number
      const payload: Record<string, unknown> = {
        title: article.title,
        slug: article.slug,
        status: article.status,
        content: article.content,
        blocks: article.blocks,
      }
      
      // Only add optional fields if they have values
      if (article.excerpt) {
        payload.excerpt = article.excerpt
      }
      if (typeof article.category_id === 'number') {
        payload.category_id = article.category_id
      }

      if (isNew) {
        const created = await createContent(payload)
        setMessage({ type: 'success', text: 'Article created successfully!' })
        // Navigate to edit view
        setTimeout(() => navigate(`/admin/articles/${created.id}`), 1000)
      } else {
        await updateContent(Number(id), payload)
        setMessage({ type: 'success', text: 'Article saved successfully!' })
      }
    } catch (error: any) {
      console.error('Failed to save article:', error)
      let errorMsg = 'Failed to save article'
      const detail = error.response?.data?.detail
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors
        errorMsg = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
      } else if (detail) {
        errorMsg = JSON.stringify(detail)
      }
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/articles"
            className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Create Article' : 'Edit Article'}
            </h1>
            <p className="text-steel-400 text-sm">
              {isNew ? 'Add a new article to your site' : `Editing: ${article.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <a
              href={`/article/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-steel-800 text-steel-300 rounded-lg hover:bg-steel-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Title *</label>
            <input
              type="text"
              value={article.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Article title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Slug *</label>
            <input
              type="text"
              value={article.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 font-mono text-sm"
              placeholder="article-url-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Category</label>
            <select
              value={article.category_id || ''}
              onChange={(e) =>
                setArticle((prev) => ({
                  ...prev,
                  category_id: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Status</label>
            <select
              value={article.status}
              onChange={(e) =>
                setArticle((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))
              }
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Excerpt</label>
          <textarea
            value={article.excerpt}
            onChange={(e) => setArticle((prev) => ({ ...prev, excerpt: e.target.value }))}
            rows={2}
            className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-none"
            placeholder="Short description shown in article lists..."
          />
        </div>
      </div>

      {/* Content Blocks */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Content</h2>
        <BlockEditor
          blocks={article.blocks}
          onChange={(blocks) => setArticle((prev) => ({ ...prev, blocks }))}
        />
      </div>
    </div>
  )
}

