const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

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

// Helper function for DELETE requests
export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};

// Helper for form data requests (file uploads, etc.)
export const apiPostFormData = <T>(endpoint: string, formData: FormData): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: 'POST',
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
