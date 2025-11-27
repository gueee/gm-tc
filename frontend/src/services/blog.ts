import { api } from './api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BlogPostCreate {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published?: boolean;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  published?: boolean;
}

export interface BlogPostListResponse {
  items: BlogPost[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BlogListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface BlogAdminListParams extends BlogListParams {
  published_only?: boolean;
}

export const blogService = {
  // Public endpoints
  async list(params: BlogListParams = {}): Promise<BlogPostListResponse> {
    const response = await api.get<BlogPostListResponse>('/blog/posts', { params });
    return response.data;
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    const response = await api.get<BlogPost>(`/blog/posts/${slug}`);
    return response.data;
  },

  // Admin endpoints
  async listAdmin(params: BlogAdminListParams = {}): Promise<BlogPostListResponse> {
    const response = await api.get<BlogPostListResponse>('/blog/admin/posts', { params });
    return response.data;
  },

  async getAdmin(id: string): Promise<BlogPost> {
    const response = await api.get<BlogPost>(`/blog/admin/posts/${id}`);
    return response.data;
  },

  async create(data: BlogPostCreate): Promise<BlogPost> {
    const response = await api.post<BlogPost>('/blog/admin/posts', data);
    return response.data;
  },

  async update(id: string, data: BlogPostUpdate): Promise<BlogPost> {
    const response = await api.put<BlogPost>(`/blog/admin/posts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/blog/admin/posts/${id}`);
  },
};

