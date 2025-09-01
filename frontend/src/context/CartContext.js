import React, { createContext, useState, useContext } from "react";
import API from "../services/api"; // configured axios instance

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Helper to get token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch cart contents
  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", {
        headers: getAuthHeaders(),
      });
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Get cart error:", err);
      throw err;
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await API.post(
        "/cart/items",
        { product_id: productId, quantity },
        { headers: getAuthHeaders() }
      );
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Add to cart error:", err);
      throw err;
    }
  };

  // Update item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      const res = await API.put(
        `/cart/items/${itemId}`,
        { quantity },
        { headers: getAuthHeaders() }
      );
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Update cart item error:", err);
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const res = await API.delete(`/cart/items/${itemId}`, {
        headers: getAuthHeaders(),
      });
      setCart(res.data);
      return res.data;
    } catch (err) {
      console.error("Remove cart item error:", err);
      throw err;
    }
  };

  // Clear local cart state
  const clearCartContext = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCartContext,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
