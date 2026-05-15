export type UserRole = "ADMIN" | "USER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  tokenVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  tokenVersion?: number;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface JwtMeResponse {
  sub?: number;
  id?: number;
  email: string;
  role: UserRole;
  tokenVersion?: number;
  name?: string;
  isActive?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}