import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, setUser, logout } = useContext(AuthContext);

  // Check login status when Navbar mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          credentials: "include", // send cookies
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
    checkAuth();
  }, [setUser]);

  // Use context-provided logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login"; // redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      style={{
        background: "#222",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Link to="/" style={{ color: "#fff", marginRight: "10px" }}>Home</Link>
        <Link to="/products" style={{ color: "#fff", marginRight: "10px" }}>Products</Link>
        <Link to="/cart" style={{ color: "#fff", marginRight: "10px" }}>Cart</Link>
      </div>

      <div>
        {!user ? (
          <Link to="/login" style={{ color: "#fff", marginRight: "10px" }}>Login</Link>
        ) : (
          <>
            <span style={{ color: "#0f0", marginRight: "10px" }}>
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                color: "#fff",
                background: "transparent",
                border: "1px solid #fff",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
