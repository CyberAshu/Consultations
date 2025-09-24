// Normalize API base URL
// - In production, prefer relative "/api/v1" to avoid CORS/mixed-content issues
// - If an absolute HTTP URL is provided for the same host while page is HTTPS, upgrade to HTTPS
let API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api/v1').trim();

try {
  if (typeof window !== 'undefined') {
    // If base is absolute and uses http while page is https, and host matches, upgrade to https
    if (API_BASE_URL.startsWith('http://') && window.location.protocol === 'https:') {
      const u = new URL(API_BASE_URL);
      const pageHost = window.location.hostname.replace(/^www\./, '');
      const apiHost = u.hostname.replace(/^www\./, '');
      if (apiHost === pageHost) {
        u.protocol = 'https:';
        API_BASE_URL = u.origin + u.pathname.replace(/\/$/, '');
      }
    }
    // Ensure no trailing slash at end (endpoints already start with "/")
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
  }
} catch (_) {
  // If URL parsing fails (e.g., in SSR), keep as-is
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to handle API requests
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage: any = `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else {
        try {
          const errorData = await response.json();
          const detail = (errorData && errorData.detail) ?? (errorData && errorData.message);
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail) && detail.length > 0) {
            // FastAPI validation errors
            const first = detail[0];
            errorMessage = first?.msg || first?.message || JSON.stringify(first);
          } else if (detail && typeof detail === 'object') {
            errorMessage = detail.message || JSON.stringify(detail);
          } else if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.message || JSON.stringify(errorData);
          }
        } catch {
          // If we can't parse error response, use default message
        }
      }
      
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage);
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return response.text() as unknown as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
}

// Helper function for GET requests
export const apiGet = <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  let searchParams = '';
  if (params) {
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredParams[key] = String(value);
      }
    });
    if (Object.keys(filteredParams).length > 0) {
      searchParams = `?${new URLSearchParams(filteredParams)}`;
    }
  }
  return apiRequest<T>(`${endpoint}${searchParams}`, { method: 'GET' });
};

// Helper function for POST requests
export const apiPost = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// Helper function for PUT requests
export const apiPut = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// Helper function for PATCH requests
export const apiPatch = <T>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// Helper function for DELETE requests
export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};

// Helper for form data requests (file uploads, etc.)
export const apiPostFormData = <T>(endpoint: string, formData: FormData, method: string = 'POST'): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: method.toUpperCase(),
    body: formData,
    headers: {},
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return fetch(url, config).then(async response => {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If we can't parse error response, use default message
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  });
};

// API object for services that expect a unified interface
export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  postFormData: apiPostFormData
};

// Export normalized base URL for other modules (SSE, polling, etc.)
export { API_BASE_URL };
