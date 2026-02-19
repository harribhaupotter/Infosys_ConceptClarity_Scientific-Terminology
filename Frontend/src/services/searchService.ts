/**
 * Search Service
 */

// import { apiRequest } from "./api";

// export const explainTerm = async (term: string) => {
//   const token = localStorage.getItem("token");
//   if (!token) throw new Error("Not authenticated");

//   return apiRequest("/explain", "POST", { term }, token);
// };

import { apiRequest } from "./api";
import type { Language } from "../utils/language";

export const explainTerm = async (term: string, isGuest = false, level = "student", language: Language = "en") => {
  const token = localStorage.getItem("token");

  if (isGuest) {
    return apiRequest("/explain/guest", "POST", { term, level, language });
  }

  if (!token) throw new Error("Not authenticated");

  return apiRequest("/explain", "POST", { term, level, language }, token);
};

export const getSearchHistory = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/user/search-history", "GET", undefined, token);
};
