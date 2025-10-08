import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Order History</h2>
      {orders.length === 0 ? (
        <p>No past orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <h3>Order #{order.id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ${(order.total_amount / 100).toFixed(2)}</p>
            <p>Date: {new Date(order.created_at).toLocaleString()}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  Product ID: {item.product_id}, Qty: {item.quantity}, Price: $
                  {item.price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;

const styles = {
  container: { maxWidth: "600px", margin: "40px auto" },
  heading: { textAlign: "center", marginBottom: "20px" },
  orderCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    backgroundColor: "#f9fafb",
  },
};
