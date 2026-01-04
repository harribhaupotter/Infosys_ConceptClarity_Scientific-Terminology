/**
 * User Service
 */

import { apiRequest } from "./api";

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/user/profile", "GET", undefined, token);
};

