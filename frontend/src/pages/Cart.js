import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Your cart is empty</p>
        <button
          onClick={() => navigate("/products")}
          style={{
            marginTop: "20px",
            padding: "10px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
        >
          ← Continue Shopping
        </button>
      </div>
    );

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Number(value) }));
  };

  const handleUpdate = async (itemId) => {
    const quantity = quantities[itemId];
    if (quantity > 0) {
      await updateCartItem(itemId, quantity);
    }
  };

  const totalPrice = cart.items
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <button
        onClick={() => navigate("/products")}
        style={{
          marginBottom: "20px",
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          background: "#6c757d",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Continue Shopping
      </button>

      <h1 style={{ marginBottom: "20px", textAlign: "center" }}>Your Cart</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {cart.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <p style={{ margin: "5px 0" }}>
                Price:{" "}
                <span style={{ color: "#28a745", fontWeight: "bold" }}>
                  ${item.price}
                </span>
              </p>
              <p style={{ margin: "5px 0" }}>Quantity: {item.quantity}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="number"
                min="1"
                value={quantities[item.id] ?? item.quantity}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "80px",
                }}
              />
              <button
                onClick={() => handleUpdate(item.id)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.background = "#0056b3")}
                onMouseOut={(e) => (e.target.style.background = "#007bff")}
              >
                Update
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#dc3545",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.background = "#a71d2a")}
                onMouseOut={(e) => (e.target.style.background = "#dc3545")}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "30px",
          textAlign: "right",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Total: ${totalPrice}
      </div>
    </div>
  );
};

export default Cart;
