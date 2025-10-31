import { api } from './api';

export interface Part {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  specifications: Record<string, any>;
  current_stock: number;
  minimum_stock: number;
  unit_price: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_low_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface PartCreate {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  specifications?: Record<string, any>;
  current_stock?: number;
  minimum_stock?: number;
  unit_price?: number;
}

export interface PartUpdate {
  name?: string;
  description?: string;
  category?: string;
  specifications?: Record<string, any>;
  minimum_stock?: number;
  unit_price?: number;
}

export interface StockAdjustment {
  quantity: number;
  reason?: string;
}

export interface PartListResponse {
  items: Part[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PartsListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  low_stock_only?: boolean;
}

export const partsService = {
  async list(params: PartsListParams = {}): Promise<PartListResponse> {
    const response = await api.get<PartListResponse>('/parts/', { params });
    return response.data;
  },

  async get(id: string): Promise<Part> {
    const response = await api.get<Part>(`/parts/${id}`);
    return response.data;
  },

  async create(data: PartCreate): Promise<Part> {
    const response = await api.post<Part>('/parts/', data);
    return response.data;
  },

  async update(id: string, data: PartUpdate): Promise<Part> {
    const response = await api.patch<Part>(`/parts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/parts/${id}`);
  },

  async adjustStock(id: string, adjustment: StockAdjustment): Promise<Part> {
    const response = await api.patch<Part>(`/parts/${id}/stock`, adjustment);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/parts/categories');
    return response.data;
  },
};
