// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  error: {
    code: string;
    details?: unknown;
    timestamp: string;
  } | null;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Wallet Types
export interface WalletBalance {
  balance: string;
}

// Error Types
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}