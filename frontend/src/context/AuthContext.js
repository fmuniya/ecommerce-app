import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from token on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/users/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const googleLogin = async (credential) => {
    const res = await API.post("/users/auth/google", { credential });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
