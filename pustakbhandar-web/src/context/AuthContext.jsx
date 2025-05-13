import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../utils/toast';
import { Permissions } from '../constants/permissions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Function to get auth headers
  const getAuthHeaders = () => {
    const session = localStorage.getItem('userSession');
    if (!session) return {};
    
    const { token } = JSON.parse(session);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Function to check if token is expired
  const isTokenExpired = (expirationDate) => {
    return new Date(expirationDate) <= new Date();
  };

  useEffect(() => {
    // Check for stored session on mount
    const storedSession = localStorage.getItem('userSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Check if token is expired
        if (!isTokenExpired(session.tokenExpiration)) {
          setUser(session);
        } else {
          localStorage.removeItem('userSession');
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('userSession');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // First try to parse as JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get the text
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data || !data.roles || !Array.isArray(data.roles)) {
        throw new Error('Invalid response format from server');
      }
      
      // Store the session
      localStorage.setItem('userSession', JSON.stringify(data));
      
      // Update user state
      setUser(data);

      // Show success message
      showSuccess('Login successful!');

      // Redirect based on role
      if (data.roles.includes('Admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }

      return data;
    } catch (error) {
      showError(error.message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userSession');
    setUser(null);
    navigate('/login', { replace: true });
    showSuccess('Logged out successfully');
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const value = {
    user,
    loading,
    isLoggingIn,
    login,
    logout,
    hasPermission,
    hasRole,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 