import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await API.get("/users/me");
          setUser(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    

    fetchUser();
  }, []);

  // Normal email/password login
  const login = async (email, password) => {
    setLoading(true); // start loading
    try {
      const res = await API.post("/users/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      // fetchCart() if you have it
      return user;
    } finally {
      setLoading(false); // always stop loading
    }
  };

  // Google login
  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const res = await API.post("/users/auth/google", { credential });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      // fetchCart() if you have it
      return user;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
