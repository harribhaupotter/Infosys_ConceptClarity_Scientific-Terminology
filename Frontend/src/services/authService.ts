/**
 * Authentication Service
 * This file contains placeholder functions for authentication API calls.
 * Replace these with actual HTTP requests when backend is ready.
 */

import { apiRequest } from "./api";

export const signup = async (name: string, email: string, password: string) => {
  return apiRequest("/auth/signup", "POST", {
    name,
    email,
    password,
  });
};

export const login = async (email: string, password: string) => {
  const data = await apiRequest("/auth/login", "POST", {
    email,
    password,
  });

  localStorage.setItem("token", data.access_token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

