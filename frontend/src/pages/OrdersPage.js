import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const OrdersPage = () => {
  const { orders } = useContext(CartContext);

  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>No past orders yet</h2>
        <p>Once you checkout, your orders will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Order History</h1>
      {orders.map((order, index) => (
        <div
          key={order.id || index}
          style={{
            padding: "15px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Order #{order.id || index + 1}</h3>
          <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.name} (x{item.quantity}) - ${item.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
