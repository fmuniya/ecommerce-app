import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  if (cart.length === 0)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Your cart is empty 🛒</h2>
        <p>Add some products to see them here!</p>
      </div>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Your Cart</h1>

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            backgroundColor: "#fafafa",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 5px" }}>{item.name}</h3>
            <p style={{ margin: 0, color: "#555" }}>Quantity: {item.quantity}</p>
            <p style={{ margin: 0, fontWeight: "bold" }}>${item.price}</p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              background: "#dc3545",
              color: "white",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={clearCart}
          style={{
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;
