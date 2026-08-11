import axios from "axios";

// Backend Base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// Register User
// ==========================
export const registerUser = async (userData) => {
  const response = await API.post("/register", userData);
  return response.data;
};

// ==========================
// Login User
// ==========================
export const loginUser = async (userData) => {
  const response = await API.post("/login", userData);

  // Save JWT Token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

// ==========================
// Logout
// ==========================
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ==========================
// Get Token
// ==========================
export const getToken = () => {
  return localStorage.getItem("token");
};

// ==========================
// Get Logged User
// ==========================
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};