"use client";

import { apiFetch } from "./apiClient";
import type { LoginResponse, RegisterResponse, VerifyEmailResponse } from "./types";

export function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", { method: "POST", body: data });
}

export function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return apiFetch<VerifyEmailResponse>("/auth/verify-email", { query: { token } });
}

export function login(data: { email: string; password: string }): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: data });
}

export function refresh(): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/refresh", { method: "POST" });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function resendVerification(email: string): Promise<void> {
  return apiFetch<void>("/auth/resend-verification", { method: "POST", body: { email } });
}

export function forgotPassword(email: string): Promise<void> {
  return apiFetch<void>("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(data: { token: string; newPassword: string }): Promise<void> {
  return apiFetch<void>("/auth/reset-password", { method: "POST", body: data });
}
