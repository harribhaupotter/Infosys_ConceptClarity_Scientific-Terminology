/**
 * Save Service
 */

import { apiRequest } from "./api";

export interface SaveData {
  term: string;
  explanation: string;
}

export interface SavedExplanation {
  term: string;
  explanation: string;
  saved_at: string;
}

export const saveExplanation = async (data: SaveData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/save", "POST", data, token);
};

export const getSavedExplanations = async (): Promise<SavedExplanation[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/user/saved-explanations", "GET", undefined, token);
};

export const deleteSavedExplanation = async (term: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  // Pass term as query parameter
  return apiRequest(`/save?term=${encodeURIComponent(term)}`, "DELETE", undefined, token);
};
