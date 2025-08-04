import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // Get user data and access token from localStorage
  const userStr = localStorage.getItem('user')
  const accessToken = localStorage.getItem('access_token')
  const expiresAt = localStorage.getItem('token_expires_at')
  
  if (!userStr || !accessToken) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />
  }

  // Check if token is expired
  if (expiresAt) {
    const now = Date.now() / 1000; // Convert to seconds
    const expiry = parseInt(expiresAt, 10);
    
    if (now >= expiry) {
      // Token expired, clear auth data and redirect to login
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expires_at')
      return <Navigate to="/login" replace />
    }
  }

  try {
    const user = JSON.parse(userStr)

    // Check role-based access if allowedRoles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect to their dashboard
        switch (user.role) {
          case 'admin':
            return <Navigate to="/admin-dashboard" replace />
          case 'client':
            return <Navigate to="/client-dashboard" replace />
          case 'rcic':
            return <Navigate to="/rcic-dashboard" replace />
          default:
            return <Navigate to="/login" replace />
        }
      }
    }

    // User is authenticated and has required role
    return <>{children}</>
  } catch (error) {
    // Invalid user data in localStorage
    localStorage.removeItem('user')
    return <Navigate to="/login" replace />
  }
}
