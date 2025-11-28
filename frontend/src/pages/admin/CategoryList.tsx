import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { getCategories, deleteCategory, updateCategory, Category } from '../../services/blog'

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const data = await getCategories(false)
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete category'
      alert(errorMsg)
      setDeleteConfirm(null)
    }
  }

  async function handleToggleActive(category: Category) {
    try {
      await updateCategory(category.id, { is_active: !category.is_active })
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c))
      )
    } catch (error) {
      console.error('Failed to update category:', error)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-steel-400">{categories.length} categories</p>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      {/* Categories List */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-steel-400 mb-4">No categories yet</p>
            <Link
              to="/admin/categories/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copper-400/10 text-copper-400 rounded-lg hover:bg-copper-400/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first category
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-steel-700">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-steel-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-steel-500 cursor-grab" />
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#374151' }}
                  >
                    {category.icon ? (
                      <span className="text-white">{getIcon(category.icon)}</span>
                    ) : (
                      <span className="text-white text-lg font-bold">{category.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{category.name}</h3>
                    <p className="text-sm text-steel-400">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      category.is_active
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-steel-700 text-steel-400 hover:bg-steel-600'
                    }`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </button>
                  {/* Actions */}
                  <button
                    onClick={() => navigate(`/admin/categories/${category.id}`)}
                    className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === category.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(category.id)}
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
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2 text-steel-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

