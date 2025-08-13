import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

class PasswordResetService {
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await axios.post(
        `${API_BASE_URL}/password-reset/request-reset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      // For security, don't reveal if user exists or not
      return {
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link shortly.'
      };
    }
  }

  async updatePassword(newPassword: string): Promise<PasswordResetResponse> {
    try {
      // Extract tokens from URL
      const tokens = this.extractTokensFromUrl();
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Invalid or missing reset tokens. Please request a new password reset.');
      }

      const formData = new FormData();
      formData.append('new_password', newPassword);
      formData.append('access_token', tokens.access_token);
      formData.append('refresh_token', tokens.refresh_token);

      const response = await axios.post(
        `${API_BASE_URL}/password-reset/confirm-reset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update password');
    }
  }

  private extractTokensFromUrl(): { access_token?: string; refresh_token?: string; expires_at?: string } {
    // Check URL hash fragment first (most common for Supabase redirects)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    return {
      access_token: hashParams.get('access_token') || queryParams.get('access_token') || undefined,
      refresh_token: hashParams.get('refresh_token') || queryParams.get('refresh_token') || undefined,
      expires_at: hashParams.get('expires_at') || queryParams.get('expires_at') || undefined
    };
  }

  // Simulate session check for reset password flow
  async getSession() {
    // For now, we'll assume the user has a valid session if they reach the reset page
    // In a real implementation, this would check for valid reset tokens
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.substring(1));
    
    // Check if we have reset tokens in URL (from email link)
    const hasResetTokens = urlParams.has('access_token') || fragment.has('access_token') ||
                          urlParams.has('token') || fragment.has('token');
    
    return hasResetTokens ? { user: { email: 'user@example.com' } } : null;
  }

  // Sign out user (placeholder)
  async signOut() {
    // Placeholder for sign out functionality
    console.log('Sign out called');
  }

  // Placeholder for auth state change listener
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Placeholder implementation
    return { unsubscribe: () => {} };
  }
}

export const passwordResetService = new PasswordResetService();
