import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";

const getApiBase = () => import.meta.env.VITE_API_URL || "/api";

async function fetchMe(token) {
  if (!token) return null;
  try {
    const { data } = await axios.get(`${getApiBase()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// STUDENT AUTH
// ─────────────────────────────────────────────────────────────────
const StudentCtx = createContext(null);

function studentReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case "SET_LOADING":
      return { ...state, loading: false };
    case "LOGIN":
      return { ...state, user: action.payload, token: action.payload.token, isAuthenticated: true, loading: false };
    case "LOGOUT":
      return { user: null, token: null, isAuthenticated: false, loading: false };
    case "UPDATE":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function StudentAuthProvider({ children }) {
  const [state, dispatch] = useReducer(studentReducer, {
    user: null,
    token: localStorage.getItem("learnify-student-token") || null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("learnify-student-token");
    if (!token) {
      dispatch({ type: "SET_LOADING" });
      return;
    }
    fetchMe(token).then((user) => {
      if (user && user.role === "student") {
        dispatch({ type: "SET_USER", payload: user });
      } else {
        localStorage.removeItem("learnify-student-token");
        dispatch({ type: "SET_LOADING" });
      }
    });
  }, []);

  async function login(credentials) {
    const { data } = await axios.post(`${getApiBase()}/auth/login`, credentials);
    const user = data.data;
    if (user.role !== "student") {
      const err = new Error("This is an admin account. Please use Admin Login.");
      err.response = { data: { message: err.message } };
      throw err;
    }
    localStorage.setItem("learnify-student-token", user.token);
    dispatch({ type: "LOGIN", payload: user });
    return user;
  }

  async function register(body) {
    const { data } = await axios.post(`${getApiBase()}/auth/register`, body);
    const user = data.data;
    localStorage.setItem("learnify-student-token", user.token);
    dispatch({ type: "LOGIN", payload: user });
    return user;
  }

  function logout() {
    localStorage.removeItem("learnify-student-token");
    dispatch({ type: "LOGOUT" });
  }

  function updateUser(updates) {
    dispatch({ type: "UPDATE", payload: updates });
  }

  return (
    <StudentCtx.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </StudentCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────────────────────────
const AdminCtx = createContext(null);

function adminReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case "SET_LOADING":
      return { ...state, loading: false };
    case "LOGIN":
      return { ...state, user: action.payload, token: action.payload.token, isAuthenticated: true, loading: false };
    case "LOGOUT":
      return { user: null, token: null, isAuthenticated: false, loading: false };
    case "UPDATE":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AdminAuthProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, {
    user: null,
    token: localStorage.getItem("learnify-admin-token") || null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("learnify-admin-token");
    if (!token) {
      dispatch({ type: "SET_LOADING" });
      return;
    }
    fetchMe(token).then((user) => {
      if (user && user.role === "admin") {
        dispatch({ type: "SET_USER", payload: user });
      } else {
        localStorage.removeItem("learnify-admin-token");
        dispatch({ type: "SET_LOADING" });
      }
    });
  }, []);

  async function login(credentials) {
    const { data } = await axios.post(`${getApiBase()}/auth/login`, credentials);
    const user = data.data;
    if (user.role !== "admin") {
      const err = new Error("Access denied. Admin account required.");
      err.response = { data: { message: err.message } };
      throw err;
    }
    localStorage.setItem("learnify-admin-token", user.token);
    dispatch({ type: "LOGIN", payload: user });
    return user;
  }

  function logout() {
    localStorage.removeItem("learnify-admin-token");
    dispatch({ type: "LOGOUT" });
  }

  function updateUser(updates) {
    dispatch({ type: "UPDATE", payload: updates });
  }

  return (
    <AdminCtx.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AdminCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────
export const useAuth      = () => useContext(StudentCtx);
export const useAdminAuth = () => useContext(AdminCtx);
