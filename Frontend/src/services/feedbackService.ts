/**
 * Feedback Service
 */

import { apiRequest } from "./api";

export interface FeedbackData {
  term: string;
  rating: "positive" | "negative";
  reason?: string;
  explanation: string;
}

export const submitFeedback = async (data: FeedbackData, isGuest = false) => {
  const token = localStorage.getItem("token");

  console.log("Submitting feedback:", { data, isGuest, hasToken: !!token });

  if (isGuest) {
    return apiRequest("/feedback/guest", "POST", data);
  }

  if (!token) throw new Error("Not authenticated");

  return apiRequest("/feedback", "POST", data, token);
};
