import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.withCredentials = true; // Send cookies with requests

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const newToken = response.data.data.accessToken;
        setAccessToken(newToken);
        localStorage.setItem('accessToken', newToken);
        
        // Update axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      setAccessToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    return null;
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token every 10 minutes (before 15min expiration)
    const refreshInterval = setInterval(async () => {
      await refreshAccessToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshAccessToken]);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token is still valid
        try {
          await axios.get(`${API_URL}/auth/me`);
        } catch (error) {
          // Try to refresh token
          const newToken = await refreshAccessToken();
          if (!newToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('authUser');
            setAccessToken(null);
            setUser(null);
          }
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [refreshAccessToken]);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    if (response.data.success) {
      const { accessToken: token, user: userData } = response.data.data;
      setAccessToken(token);
      setUser(userData);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const logoutAll = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout-all`);
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
    
    if (response.data.success) {
      // Logout after password change
      await logout();
    }
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      login, 
      logout, 
      logoutAll,
      changePassword,
      isAuthenticated, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
