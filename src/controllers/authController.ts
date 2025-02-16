// src/controllers/authController.ts
import { useState } from 'react';
import { authService } from '../services/authService';

export function useAuthController() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      await authService.login(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authService.logout();
  }

  function isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  return {
    login,
    logout,
    isAuthenticated,
    loading,
    error
  };
}
