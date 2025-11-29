import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { getCategories, createCategory, updateCategory } from '../../services/blog'

const ICON_OPTIONS = [
  'Printer', 'Code', 'Wrench', 'Cpu', 'Database', 'Globe',
  'Camera', 'Music', 'Palette', 'Lightbulb', 'Rocket', 'Zap',
  'Box', 'Layers', 'Settings', 'Tool', 'Terminal', 'FileCode',
]

const COLOR_OPTIONS = [
  '#D97706', // Copper
  '#EF4444', // Red
  '#F97316', // Orange
  '#FBBF24', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
]

interface CategoryData {
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
}

function slugify(text: string, finalCleanup = true): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')

  // Only remove leading/trailing hyphens on final cleanup (blur)
  if (finalCleanup) {
    slug = slug.replace(/^-+|-+$/g, '')
  }
  return slug
}

export default function CategoryEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [autoSlug, setAutoSlug] = useState(isNew)

  const [category, setCategory] = useState<CategoryData>({
    name: '',
    slug: '',
    description: '',
    icon: 'Folder',
    color: '#D97706',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (!isNew && id) {
      fetchCategory()
    }
  }, [id])

  async function fetchCategory() {
    try {
      const categories = await getCategories(false)
      const found = categories.find((c) => c.id === Number(id))
      if (found) {
        setCategory({
          name: found.name,
          slug: found.slug,
          description: found.description || '',
          icon: found.icon || 'Folder',
          color: found.color || '#D97706',
          sort_order: found.sort_order,
          is_active: found.is_active,
        })
        setAutoSlug(false)
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      setMessage({ type: 'error', text: 'Failed to load category' })
    } finally {
      setIsLoading(false)
    }
  }

  function handleNameChange(name: string) {
    setCategory((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? slugify(name) : prev.slug,
    }))
  }

  function handleSlugChange(slug: string) {
    setAutoSlug(false)
    // Don't remove trailing hyphens while typing
    setCategory((prev) => ({ ...prev, slug: slugify(slug, false) }))
  }

  function handleSlugBlur() {
    // Clean up trailing hyphens when user leaves the field
    setCategory((prev) => ({ ...prev, slug: slugify(prev.slug, true) }))
  }

  async function handleSave() {
    if (!category.name.trim() || !category.slug.trim()) {
      setMessage({ type: 'error', text: 'Name and slug are required' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      if (isNew) {
        const created = await createCategory(category)
        setMessage({ type: 'success', text: 'Category created successfully!' })
        setTimeout(() => navigate(`/admin/categories/${created.id}`), 1000)
      } else {
        await updateCategory(Number(id), category)
        setMessage({ type: 'success', text: 'Category saved successfully!' })
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to save category'
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setIsSaving(false)
    }
  }

  function getIcon(iconName: string) {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
    const Icon = icons[iconName]
    return Icon ? <Icon className="w-5 h-5" /> : null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/categories"
            className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Create Category' : 'Edit Category'}
            </h1>
            <p className="text-steel-400 text-sm">
              {isNew ? 'Add a new category' : `Editing: ${category.name}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isNew ? 'Create' : 'Save'}
        </button>
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

      {/* Form */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Name *</label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Category name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Slug *</label>
            <input
              type="text"
              value={category.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={handleSlugBlur}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 font-mono text-sm"
              placeholder="category-slug"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Description</label>
          <textarea
            value={category.description}
            onChange={(e) => setCategory((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-none"
            placeholder="Category description..."
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((iconName) => (
              <button
                key={iconName}
                onClick={() => setCategory((prev) => ({ ...prev, icon: iconName }))}
                className={`p-3 rounded-lg transition-colors ${
                  category.icon === iconName
                    ? 'bg-copper-400 text-steel-900'
                    : 'bg-steel-900 text-steel-400 hover:bg-steel-700 hover:text-copper-400'
                }`}
                title={iconName}
              >
                {getIcon(iconName)}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                onClick={() => setCategory((prev) => ({ ...prev, color }))}
                className={`w-10 h-10 rounded-lg transition-all ${
                  category.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-steel-800' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Preview</label>
          <div className="inline-flex items-center gap-3 p-4 bg-steel-900 rounded-lg">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-white">{getIcon(category.icon)}</span>
            </div>
            <div>
              <h3 className="font-medium text-white">{category.name || 'Category Name'}</h3>
              <p className="text-sm text-steel-400">/{category.slug || 'category-slug'}</p>
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={category.is_active}
            onChange={(e) => setCategory((prev) => ({ ...prev, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-steel-700 bg-steel-900 text-copper-400 focus:ring-copper-400"
          />
          <label htmlFor="is_active" className="text-sm text-steel-300">
            Active (visible on homepage)
          </label>
        </div>
      </div>
    </div>
  )
}

