/**
 * User Service
 */

import axios from "axios";

const API_URL = "http://127.0.0.1:8000";
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // 👈 returns { name, email }
};
