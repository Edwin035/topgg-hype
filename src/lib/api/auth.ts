import { apiRequest } from "./http";
import type { LoginResponse, JwtMeResponse } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  userId: number;
  password: string;
}

export async function loginClient(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getMe() {
  return apiRequest<JwtMeResponse>("/auth/me", {
    method: "GET",
  });
}

export async function changePassword(payload: ChangePasswordPayload) {
  return apiRequest(`/users/${payload.userId}`, {
    method: "PATCH",
    body: {
      password: payload.password,
    },
  });
}