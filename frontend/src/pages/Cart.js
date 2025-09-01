import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  if (!cart || !cart.items || cart.items.length === 0)
    return <p>Your cart is empty</p>;

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Number(value) }));
  };

  const handleUpdate = async (itemId) => {
    const quantity = quantities[itemId];
    if (quantity > 0) {
      await updateCartItem(itemId, quantity);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1>Your Cart</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cart.items.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <strong>{item.name}</strong> - ${item.price} x {item.quantity}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="number"
                min="1"
                value={quantities[item.id] ?? item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.id, e.target.value)
                }
                style={{ width: "60px", padding: "5px" }}
              />
              <button onClick={() => handleUpdate(item.id)}>Update</button>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        Total: $
        {cart.items
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)}
      </p>

      <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
        <button
          onClick={() => navigate("/products")}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "6px",
            background: "#6c757d",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate("/checkout")}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "6px",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
