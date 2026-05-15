import { apiRequest } from "./http";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types";

export async function createUser(payload: CreateUserPayload) {
  return apiRequest<User>("/users", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
  return apiRequest<User>(`/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function getUserById(id: number) {
  return apiRequest<User>(`/users/${id}`, {
    method: "GET",
  });
}

export async function getUsers() {
  return apiRequest<User[]>("/users", {
    method: "GET",
  });
}