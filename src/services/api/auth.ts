import { api, setToken, removeToken } from './client';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from './types';

export const authApi = {
  /**
   * Register a new user
   * @param data - Registration data (username, email, password)
   * @returns Authentication response with token and user data
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const token = response.accessToken || response.token;
    if (token) {
      setToken(token);
    }
    return response;
  },

  /**
   * Login user
   * @param data - Login credentials (email, password)
   * @returns Authentication response with token and user data
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    const token = response.accessToken || response.token;
    if (token) {
      setToken(token);
    }
    return response;
  },

  /**
   * Logout user
   * @returns Success message
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always remove token, even if API call fails
      removeToken();
    }
  },

  /**
   * Get current user information
   * @returns Current user data
   */
  async getMe(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.user;
  },

  /**
   * Check if user is authenticated by verifying token
   * @returns User data if authenticated, null otherwise
   */
  async checkAuth(): Promise<User | null> {
    try {
      const user = await this.getMe();
      return user;
    } catch (error) {
      removeToken();
      return null;
    }
  },

  /**
   * Initiate Google OAuth login flow
   * @returns void - Opens Google OAuth in new window
   */
  googleSignIn(): void {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`;
    const googleAuthUrl = `${apiUrl}/auth/google`;
    
    // Open in a new window with specific dimensions
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const authWindow = window.open(
      googleAuthUrl,
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
    
    if (!authWindow) {
      console.error('Failed to open auth window - popup may be blocked');
    } else {
      // Focus the popup window
      authWindow.focus();
    }
  },
};