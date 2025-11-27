import { api } from './api';

export interface HomepageContent {
  id: string;
  key: string;
  content: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageContentCreate {
  key: string;
  content: Record<string, any>;
  is_active?: boolean;
}

export interface HomepageContentUpdate {
  content?: Record<string, any>;
  is_active?: boolean;
}

export const homepageService = {
  async get(key: string): Promise<HomepageContent> {
    const response = await api.get<HomepageContent>(`/homepage/content/${key}`);
    return response.data;
  },

  async list(): Promise<HomepageContent[]> {
    const response = await api.get<HomepageContent[]>('/homepage/content');
    return response.data;
  },

  async listAdmin(): Promise<HomepageContent[]> {
    const response = await api.get<HomepageContent[]>('/homepage/admin/content');
    return response.data;
  },

  async create(data: HomepageContentCreate): Promise<HomepageContent> {
    const response = await api.post<HomepageContent>('/homepage/admin/content', data);
    return response.data;
  },

  async update(key: string, data: HomepageContentUpdate): Promise<HomepageContent> {
    const response = await api.put<HomepageContent>(`/homepage/admin/content/${key}`, data);
    return response.data;
  },

  async delete(key: string): Promise<void> {
    await api.delete(`/homepage/admin/content/${key}`);
  },
};

