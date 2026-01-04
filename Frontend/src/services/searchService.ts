/**
 * Search Service
 */

import { apiRequest } from "./api";

export const explainTerm = async (term: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/explain", "POST", { term }, token);
};


