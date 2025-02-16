// src/services/authService.ts
import { mockLogin } from '../repositories/authRepository';

class AuthService {
  private tokenKey = 'civiform_token';

  async login(username: string, password: string): Promise<void> {
    // Calls the mock repository
    const { token } = await mockLogin(username, password);
    // If successful, store token in localStorage (or cookies, etc.)
    localStorage.setItem(this.tokenKey, token);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export const authService = new AuthService();
