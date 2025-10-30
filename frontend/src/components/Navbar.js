import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { clearCartContext } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      clearCartContext();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/products" className="nav-link">
          Products
        </NavLink>
        <NavLink to="/cart" className="nav-link">
          Cart
        </NavLink>
        <NavLink to="/orders" className="nav-link">
          My Orders
        </NavLink>
      </div>

      <div className="nav-right">
        {!user ? (
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
        ) : (
          <>
            <span className="user-text">{user.name || user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
