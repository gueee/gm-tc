import api from './api'

// Types
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  content_type: string
  status: string
  blocks?: Record<string, unknown>
  extra_data?: Record<string, unknown>
  category_id?: number
  meta_title?: string
  meta_description?: string
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at?: string
  published_at?: string
  category?: {
    id: number
    name: string
    slug: string
  }
}

export interface ContentAPIResponse {
  items: BlogPost[]
  total: number
  page: number
  limit: number
  pages: number
}

// API functions
export async function getContent(params?: {
  page?: number
  limit?: number
  category?: string
  content_type?: string
}): Promise<ContentAPIResponse> {
  const response = await api.get<ContentAPIResponse>('/content', { params })
  return response.data
}

export async function getContentBySlug(slug: string): Promise<BlogPost> {
  const response = await api.get<BlogPost>(`/content/${slug}`)
  return response.data
}

export async function getContentById(id: number): Promise<BlogPost> {
  const response = await api.get<BlogPost>(`/content/by-id/${id}`)
  return response.data
}

export async function getCategories(activeOnly = true): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories', {
    params: { active_only: activeOnly },
  })
  return response.data
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await api.get<Category>(`/categories/${slug}`)
  return response.data
}

// Admin functions
export async function createContent(data: Partial<BlogPost>): Promise<BlogPost> {
  const response = await api.post<BlogPost>('/content/admin', data)
  return response.data
}

export async function updateContent(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
  const response = await api.put<BlogPost>(`/content/admin/${id}`, data)
  return response.data
}

export async function deleteContent(id: number): Promise<void> {
  await api.delete(`/content/admin/${id}`)
}

// Category admin functions
export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await api.post<Category>('/categories/admin', data)
  return response.data
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const response = await api.put<Category>(`/categories/admin/${id}`, data)
  return response.data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/admin/${id}`)
}
