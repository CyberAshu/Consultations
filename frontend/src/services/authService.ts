import { apiPost, apiGet, ApiError } from './api';
import { 
  User, 
  UserResponse, 
  LoginRequest, 
  RegisterRequest,
  AuthSession 
} from './types';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<UserResponse> {
    try {
      const response = await apiPost<UserResponse>('/auth/login', credentials);
      
      // Store tokens in localStorage
      if (response.session) {
        localStorage.setItem('access_token', response.session.access_token);
        localStorage.setItem('refresh_token', response.session.refresh_token);
        localStorage.setItem('token_expires_at', response.session.expires_at.toString());
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await apiPost<UserResponse>('/auth/register', userData);
      
      // Store tokens in localStorage if registration includes session
      if (response.session) {
        localStorage.setItem('access_token', response.session.access_token);
        localStorage.setItem('refresh_token', response.session.refresh_token);
        localStorage.setItem('token_expires_at', response.session.expires_at.toString());
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiPost<{ message: string }>('/auth/logout');
      
      // Clear localStorage
      this.clearAuthData();
      
      return response;
    } catch (error) {
      // Clear localStorage even if API call fails
      this.clearAuthData();
      throw error;
    }
  }

  // Get current user information
  async getCurrentUser(): Promise<User> {
    try {
      return await apiGet<User>('/auth/me');
    } catch (error) {
      // If getting current user fails, clear auth data
      if (error instanceof ApiError && error.status === 401) {
        this.clearAuthData();
      }
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<AuthSession> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new ApiError('No refresh token available');
    }

    try {
      const response = await apiPost<AuthSession>('/auth/refresh', { 
        refresh_token: refreshToken 
      });
      
      // Update stored tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('token_expires_at', response.expires_at.toString());
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiPost<{ message: string }>('/auth/reset-password', { email });
    } catch (error) {
      throw error;
    }
  }

  // Resend email confirmation
  async resendConfirmation(email: string): Promise<{ message: string }> {
    try {
      return await apiPost<{ message: string }>('/auth/resend-confirmation', { email });
    } catch (error) {
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }

    // Check if token is expired
    const now = Date.now() / 1000; // Convert to seconds
    const expiry = parseInt(expiresAt, 10);
    
    if (now >= expiry) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Clear authentication data
  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  }

  // Check if token needs refresh (within 5 minutes of expiry)
  shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return false;

    const now = Date.now() / 1000;
    const expiry = parseInt(expiresAt, 10);
    
    // Refresh if expires within 5 minutes (300 seconds)
    return (expiry - now) < 300;
  }

  // Auto-refresh token if needed
  async ensureValidToken(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new ApiError('User not authenticated');
    }

    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken();
      } catch (error) {
        // If refresh fails, user needs to log in again
        this.clearAuthData();
        throw new ApiError('Session expired. Please log in again.');
      }
    }
  }
}

export const authService = new AuthService();
