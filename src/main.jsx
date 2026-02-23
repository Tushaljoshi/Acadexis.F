import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuthStore } from "./store/authStore";

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (token && user) {
  useAuthStore.getState().setToken(token);
  useAuthStore.getState().setUser(JSON.parse(user));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
