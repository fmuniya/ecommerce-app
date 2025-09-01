import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext"; // import CartContext

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { clearCartContext } = useContext(CartContext); // get clearCartContext
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout
      await logout();

      // Clear cart context
      clearCartContext();

      // Navigate to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
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
        <Link to="/" style={{ color: "#fff", marginRight: "10px" }}>
          Home
        </Link>
        <Link to="/products" style={{ color: "#fff", marginRight: "10px" }}>
          Products
        </Link>
        <Link to="/cart" style={{ color: "#fff", marginRight: "10px" }}>
          Cart
        </Link>
      </div>

      <div>
        {!user ? (
          <Link to="/login" style={{ color: "#fff", marginRight: "10px" }}>
            Login
          </Link>
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
