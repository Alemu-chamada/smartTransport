const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api/v1";

let token: string | null = null;

export const apiService = {
  setToken: (newToken: string | null) => {
    token = newToken;
  },

  getToken: () => token,

  request: async <T>(
    method: string,
    path: string,
    data?: any
  ): Promise<{ data: T; status: number }> => {
    const url = `${API_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data).toString();
      const separator = url.includes('?') ? '&' : '?';
      const fullUrl = `${url}${separator}${params}`;
      return fetch(fullUrl, {
        method,
        headers,
      }).then(async (res) => {
        const json = await res.json();
        return { data: json, status: res.status };
      });
    }

    return fetch(url, options).then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        throw { ...json, status: res.status };
      }
      return { data: json, status: res.status };
    });
  },

  get: async <T>(path: string, data?: any) => apiService.request<T>('GET', path, data),
  post: async <T>(path: string, data?: any) => apiService.request<T>('POST', path, data),
  put: async <T>(path: string, data?: any) => apiService.request<T>('PUT', path, data),
  patch: async <T>(path: string, data?: any) => apiService.request<T>('PATCH', path, data),
  delete: async <T>(path: string, data?: any) => apiService.request<T>('DELETE', path, data),
};
