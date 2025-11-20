import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token from cookies
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Client-side
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1] || null;
    } else {
      // Server-side
      const cookieStore = cookies();
      return cookieStore.get('accessToken')?.value || null;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// API service functions for different modules
export const contentApi = {
  banners: {
    findAll: (params?: any) => apiClient.get('/admin/content/banners', params),
    findOne: (id: string) => apiClient.get(`/admin/content/banners/${id}`),
    create: (data: any) => apiClient.post('/admin/content/banners', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/banners/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/banners/${id}`),
    updatePosition: (id: string, position: number) => 
      apiClient.patch(`/admin/content/banners/${id}/position`, { position }),
    publish: (id: string) => apiClient.patch(`/admin/content/banners/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/banners/${id}/unpublish`),
  },
  homepage: {
    findAll: (params?: any) => apiClient.get('/admin/content/homepage', params),
    findOne: (id: string) => apiClient.get(`/admin/content/homepage/${id}`),
    findByKey: (sectionKey: string, locale: string) => 
      apiClient.get(`/admin/content/homepage/by-key/${sectionKey}?locale=${locale}`),
    create: (data: any) => apiClient.post('/admin/content/homepage', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/homepage/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/homepage/${id}`),
    updatePosition: (id: string, position: number) => 
      apiClient.patch(`/admin/content/homepage/${id}/position`, { position }),
    publish: (id: string) => apiClient.patch(`/admin/content/homepage/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/homepage/${id}/unpublish`),
  },
  clientLogos: {
    findAll: (params?: any) => apiClient.get('/admin/content/client-logos', params),
    findOne: (id: string) => apiClient.get(`/admin/content/client-logos/${id}`),
    create: (data: any) => apiClient.post('/admin/content/client-logos', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/client-logos/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/client-logos/${id}`),
    updatePosition: (id: string, position: number) => 
      apiClient.patch(`/admin/content/client-logos/${id}/position`, { position }),
    publish: (id: string) => apiClient.patch(`/admin/content/client-logos/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/client-logos/${id}/unpublish`),
  },
  testimonials: {
    findAll: (params?: any) => apiClient.get('/admin/content/testimonials', params),
    findOne: (id: string) => apiClient.get(`/admin/content/testimonials/${id}`),
    create: (data: any) => apiClient.post('/admin/content/testimonials', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/testimonials/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/testimonials/${id}`),
    updatePosition: (id: string, position: number) => 
      apiClient.patch(`/admin/content/testimonials/${id}/position`, { position }),
    publish: (id: string) => apiClient.patch(`/admin/content/testimonials/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/testimonials/${id}/unpublish`),
  },
  news: {
    findAll: (params?: any) => apiClient.get('/admin/content/news', params),
    findOne: (id: string) => apiClient.get(`/admin/content/news/${id}`),
    findBySlug: (slug: string) => apiClient.get(`/admin/content/news/slug/${slug}`),
    create: (data: any) => apiClient.post('/admin/content/news', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/news/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/news/${id}`),
    publish: (id: string) => apiClient.patch(`/admin/content/news/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/news/${id}/unpublish`),
    updateFeaturedImage: (id: string, imageUrl: string) => 
      apiClient.patch(`/admin/content/news/${id}/featured-image`, { imageUrl }),
  },
  blog: {
    findAll: (params?: any) => apiClient.get('/admin/content/blog', params),
    findOne: (id: string) => apiClient.get(`/admin/content/blog/${id}`),
    findBySlug: (slug: string) => apiClient.get(`/admin/content/blog/slug/${slug}`),
    create: (data: any) => apiClient.post('/admin/content/blog', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/blog/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/blog/${id}`),
    publish: (id: string) => apiClient.patch(`/admin/content/blog/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/blog/${id}/unpublish`),
    updateFeaturedImage: (id: string, imageUrl: string) => 
      apiClient.patch(`/admin/content/blog/${id}/featured-image`, { imageUrl }),
  },
  downloads: {
    findAll: (params?: any) => apiClient.get('/admin/content/downloads', params),
    findOne: (id: string) => apiClient.get(`/admin/content/downloads/${id}`),
    create: (data: any) => apiClient.post('/admin/content/downloads', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/downloads/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/downloads/${id}`),
    updatePosition: (id: string, position: number) => 
      apiClient.patch(`/admin/content/downloads/${id}/position`, { position }),
    publish: (id: string) => apiClient.patch(`/admin/content/downloads/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/downloads/${id}/unpublish`),
  },
  pages: {
    findAll: (params?: any) => apiClient.get('/admin/content/pages', params),
    findOne: (id: string) => apiClient.get(`/admin/content/pages/${id}`),
    findBySlug: (slug: string) => apiClient.get(`/admin/content/pages/slug/${slug}`),
    findByKey: (pageKey: string) => apiClient.get(`/admin/content/pages/key/${pageKey}`),
    create: (data: any) => apiClient.post('/admin/content/pages', data),
    update: (id: string, data: any) => apiClient.put(`/admin/content/pages/${id}`, data),
    remove: (id: string) => apiClient.delete(`/admin/content/pages/${id}`),
    publish: (id: string) => apiClient.patch(`/admin/content/pages/${id}/publish`),
    unpublish: (id: string) => apiClient.patch(`/admin/content/pages/${id}/unpublish`),
  },
};

export const inquiriesApi = {
  findAll: (params?: any) => apiClient.get('/inquiries/admin', params),
  findOne: (id: string) => apiClient.get(`/inquiries/admin/${id}`),
  updateStatus: (id: string, data: any) => apiClient.patch(`/inquiries/admin/${id}/status`, data),
  addMessage: (id: string, data: any) => apiClient.post(`/inquiries/admin/${id}/messages`, data),
  markAsSpam: (id: string) => apiClient.patch(`/inquiries/admin/${id}/spam`),
};