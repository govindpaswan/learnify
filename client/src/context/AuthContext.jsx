import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";

const API = () => import.meta.env.VITE_API_URL || "/api";

const getUser = async (token) => {
  if (!token) return null;
  try {
    const { data } = await axios.get(`${API()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  } catch { return null; }
};

// ── STUDENT ────────────────────────────────────────────────────────
const StudentCtx = createContext();

const sReducer = (state, { type, payload }) => ({
  SET:    { ...state, user: payload, isAuthenticated: true,  loading: false },
  DONE:   { ...state, loading: false },
  LOGIN:  (localStorage.setItem("learnify-student-token", payload.token), { ...state, user: payload, token: payload.token, isAuthenticated: true, loading: false }),
  LOGOUT: (localStorage.removeItem("learnify-student-token"), { user: null, token: null, loading: false, isAuthenticated: false }),
  UPDATE: { ...state, user: { ...state.user, ...payload } },
}[type] ?? state);

export const StudentAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sReducer, {
    user: null, token: localStorage.getItem("learnify-student-token"),
    loading: true, isAuthenticated: false,
  });

  useEffect(() => {
    const t = localStorage.getItem("learnify-student-token");
    if (!t) return dispatch({ type: "DONE" });
    getUser(t).then(u => {
      if (u?.role === "student") dispatch({ type: "SET", payload: u });
      else { localStorage.removeItem("learnify-student-token"); dispatch({ type: "DONE" }); }
    });
  }, []);

  const login = async (creds) => {
    const { data } = await axios.post(`${API()}/auth/login`, creds);
    if (data.data.role !== "student") {
      const e = new Error("This is an admin account. Please use the Admin Login page.");
      e.response = { data: { message: e.message } }; throw e;
    }
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  const register = async (body) => {
    const { data } = await axios.post(`${API()}/auth/register`, body);
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  return (
    <StudentCtx.Provider value={{
      ...state,
      login, register,
      logout:     () => dispatch({ type: "LOGOUT" }),
      updateUser: (u) => dispatch({ type: "UPDATE", payload: u }),
    }}>
      {children}
    </StudentCtx.Provider>
  );
};

// ── ADMIN ──────────────────────────────────────────────────────────
const AdminCtx = createContext();

const aReducer = (state, { type, payload }) => ({
  SET:    { ...state, user: payload, isAuthenticated: true,  loading: false },
  DONE:   { ...state, loading: false },
  LOGIN:  (localStorage.setItem("learnify-admin-token", payload.token), { ...state, user: payload, token: payload.token, isAuthenticated: true, loading: false }),
  LOGOUT: (localStorage.removeItem("learnify-admin-token"), { user: null, token: null, loading: false, isAuthenticated: false }),
  UPDATE: { ...state, user: { ...state.user, ...payload } },
}[type] ?? state);

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aReducer, {
    user: null, token: localStorage.getItem("learnify-admin-token"),
    loading: true, isAuthenticated: false,
  });

  useEffect(() => {
    const t = localStorage.getItem("learnify-admin-token");
    if (!t) return dispatch({ type: "DONE" });
    getUser(t).then(u => {
      if (u?.role === "admin") dispatch({ type: "SET", payload: u });
      else { localStorage.removeItem("learnify-admin-token"); dispatch({ type: "DONE" }); }
    });
  }, []);

  const login = async (creds) => {
    const { data } = await axios.post(`${API()}/auth/login`, creds);
    if (data.data.role !== "admin") {
      const e = new Error("Access denied. Admin account required.");
      e.response = { data: { message: e.message } }; throw e;
    }
    dispatch({ type: "LOGIN", payload: data.data });
    return data.data;
  };

  return (
    <AdminCtx.Provider value={{
      ...state,
      login,
      logout:     () => dispatch({ type: "LOGOUT" }),
      updateUser: (u) => dispatch({ type: "UPDATE", payload: u }),
    }}>
      {children}
    </AdminCtx.Provider>
  );
};

export const useAuth      = () => useContext(StudentCtx);
export const useAdminAuth = () => useContext(AdminCtx);
