import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  // Google login
  const handleGoogleResponse = useCallback(
    async (response) => {
      try {
        const credential = response.credential;
        const res = await API.post("/users/auth/google", { token: credential });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/products");
      } catch (err) {
        console.error("Google login error:", err);
        setError("Google login failed");
      }
    },
    [navigate]
  );

  useEffect(() => {
    /* global google */
    if (window.google) {
        console.log("TEST variable:", process.env.REACT_APP_TEST);
        console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID)
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, [handleGoogleResponse]);

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Email/password login form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px", width: "100%" }}>
          Login
        </button>
      </form>

      {/* Separator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "20px 0",
          textAlign: "center",
        }}
      >
        <hr style={{ flex: 1 }} />
        <span style={{ margin: "0 10px" }}>or</span>
        <hr style={{ flex: 1 }} />
      </div>

      {/* Google login button */}
      <div id="googleSignInDiv" style={{ width: "100%" }}></div>

      <p style={{ marginTop: "10px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
