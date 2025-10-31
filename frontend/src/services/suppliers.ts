import { api } from './api';

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SupplierCreate {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  notes?: string;
  rating?: number;
  is_active?: boolean;
}

export interface SupplierUpdate {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  notes?: string;
  rating?: number;
  is_active?: boolean;
}

export interface SupplierListResponse {
  items: Supplier[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SuppliersListParams {
  page?: number;
  per_page?: number;
  search?: string;
  active_only?: boolean;
}

export const suppliersService = {
  async list(params: SuppliersListParams = {}): Promise<SupplierListResponse> {
    const response = await api.get<SupplierListResponse>('/suppliers/', { params });
    return response.data;
  },

  async get(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  async create(data: SupplierCreate): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers/', data);
    return response.data;
  },

  async update(id: string, data: SupplierUpdate): Promise<Supplier> {
    const response = await api.patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};
