const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}`,
    }));
    throw {
      message: error.message || 'Request failed',
      statusCode: response.status,
    } as ApiError;
  }

  return response.json();
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'GET',
  });
}

export async function post<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function patch<T>(endpoint: string, data: any): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function del<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
  });
}
