import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";

const BASE_URL = () => import.meta.env.VITE_API_URL || "/api";

const fetchUserWithToken = async (token) => {
  if (!token) return null;
  try {
    const { data } = await axios.get(`${BASE_URL()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  } catch {
    return null;
  }
};

// ── STUDENT AUTH ───────────────────────────────────────────────────
const StudentAuthContext = createContext();

const studentReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case "DONE":
      return { ...state, loading: false };
    case "LOGIN":
      localStorage.setItem("learnify-student-token", action.payload.token);
      return { ...state, user: action.payload, token: action.payload.token, isAuthenticated: true, loading: false };
    case "LOGOUT":
      localStorage.removeItem("learnify-student-token");
      return { user: null, token: null, loading: false, isAuthenticated: false };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const StudentAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, {
    user: null,
    token: localStorage.getItem("learnify-student-token"),
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("learnify-student-token");
    if (!token) { dispatch({ type: "DONE" }); return; }
    fetchUserWithToken(token).then((user) => {
      if (user && user.role === "student") {
        dispatch({ type: "SET_USER", payload: user });
      } else {
        localStorage.removeItem("learnify-student-token");
        dispatch({ type: "DONE" });
      }
    });
  }, []);

  const login = async (credentials) => {
    const { data } = await axios.post(`${BASE_URL()}/auth/login`, credentials);
    if (data.data.role !== "student") {
      throw Object.assign(new Error("This is an admin account. Please use the Admin Login page."), {
        response: { data: { message: "This is an admin account. Please use the Admin Login page." } },
      });
    }
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await axios.post(`${BASE_URL()}/auth/register`, userData);
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  const logout     = ()       => dispatch({ type: "LOGOUT" });
  const updateUser = (updates) => dispatch({ type: "UPDATE_USER", payload: updates });

  return (
    <StudentAuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

// ── ADMIN AUTH ─────────────────────────────────────────────────────
const AdminAuthContext = createContext();

const adminReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case "DONE":
      return { ...state, loading: false };
    case "LOGIN":
      localStorage.setItem("learnify-admin-token", action.payload.token);
      return { ...state, user: action.payload, token: action.payload.token, isAuthenticated: true, loading: false };
    case "LOGOUT":
      localStorage.removeItem("learnify-admin-token");
      return { user: null, token: null, loading: false, isAuthenticated: false };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, {
    user: null,
    token: localStorage.getItem("learnify-admin-token"),
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("learnify-admin-token");
    if (!token) { dispatch({ type: "DONE" }); return; }
    fetchUserWithToken(token).then((user) => {
      if (user && user.role === "admin") {
        dispatch({ type: "SET_USER", payload: user });
      } else {
        localStorage.removeItem("learnify-admin-token");
        dispatch({ type: "DONE" });
      }
    });
  }, []);

  const login = async (credentials) => {
    const { data } = await axios.post(`${BASE_URL()}/auth/login`, credentials);
    if (data.data.role !== "admin") {
      throw Object.assign(new Error("Access denied. Admin account required."), {
        response: { data: { message: "Access denied. Admin account required." } },
      });
    }
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  const logout     = ()       => dispatch({ type: "LOGOUT" });
  const updateUser = (updates) => dispatch({ type: "UPDATE_USER", payload: updates });

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// ── Hooks ──────────────────────────────────────────────────────────
export const useAuth      = () => useContext(StudentAuthContext);
export const useAdminAuth = () => useContext(AdminAuthContext);
