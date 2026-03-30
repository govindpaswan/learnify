import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { StudentAuthProvider, AdminAuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <StudentAuthProvider>
          <AdminAuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: { borderRadius: "12px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" },
              }}
            />
          </AdminAuthProvider>
        </StudentAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
