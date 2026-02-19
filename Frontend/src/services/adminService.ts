/**
 * Admin Service
 */

import { apiRequest } from "./api";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  search_history?: Array<{
    term: string;
    level: string;
    explanation: string;
  }> | string[];
  saved_items?: any[];
  feedback?: any[];
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest("/admin/users", "GET", undefined, token);
};

export interface FeedbackItem {
  _id?: string;
  term: string;
  rating: string;
  reason?: string;
  explanation: string;
  user_email: string;
  user_name: string;
  created_at?: string;
}

export const getAllFeedback = async (): Promise<FeedbackItem[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiRequest("/admin/feedback", "GET", undefined, token);
};