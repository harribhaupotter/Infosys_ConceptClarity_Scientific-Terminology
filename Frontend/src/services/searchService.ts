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

export const explainTerm = async (term: string, isGuest = false) => {
  const token = localStorage.getItem("token");

  if (isGuest) {
    return apiRequest("/explain/guest", "POST", { term });
  }

  if (!token) throw new Error("Not authenticated");

  return apiRequest("/explain", "POST", { term }, token);
};

export const getSearchHistory = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return apiRequest("/user/search-history", "GET", undefined, token);
};
