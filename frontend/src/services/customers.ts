import { api } from './api';

export interface Customer {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  customer_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerCreate {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  notes?: string;
  customer_type?: string;
  is_active?: boolean;
}

export interface CustomerUpdate {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  notes?: string;
  customer_type?: string;
  is_active?: boolean;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CustomersListParams {
  page?: number;
  per_page?: number;
  search?: string;
  customer_type?: string;
  active_only?: boolean;
}

export const customersService = {
  async list(params: CustomersListParams = {}): Promise<CustomerListResponse> {
    const response = await api.get<CustomerListResponse>('/customers/', { params });
    return response.data;
  },

  async get(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async create(data: CustomerCreate): Promise<Customer> {
    const response = await api.post<Customer>('/customers/', data);
    return response.data;
  },

  async update(id: string, data: CustomerUpdate): Promise<Customer> {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
