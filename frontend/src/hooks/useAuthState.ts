import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  role: string
  // Add other user properties as needed
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export function useAuthState(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  })

  useEffect(() => {
    const checkAuthState = () => {
      const userStr = localStorage.getItem('user')
      const accessToken = localStorage.getItem('access_token')
      const expiresAt = localStorage.getItem('token_expires_at')
      
      // Check if we have valid authentication data
      if (!userStr || !accessToken) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        })
        return
      }

      // Check if token is expired
      if (expiresAt) {
        const now = Date.now() / 1000 // Convert to seconds
        const expiry = parseInt(expiresAt, 10)
        
        if (now >= expiry) {
          // Token expired, clear auth data
          localStorage.removeItem('user')
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('token_expires_at')
          
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          })
          return
        }
      }

      try {
        const user = JSON.parse(userStr)
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        })
      } catch (error) {
        // Invalid user data in localStorage
        localStorage.removeItem('user')
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        })
      }
    }

    checkAuthState()

    // Listen for storage changes (useful if user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthState()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return authState
}
