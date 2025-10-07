import React from "react";
import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎉 Payment Successful!</h1>
      <p style={styles.text}>
        Thank you for your purchase. Your order has been processed successfully.
      </p>
      <Link to="/products" style={styles.button}>
        Continue Shopping
      </Link>
    </div>
  );
};

export default Success;

// Basic inline styles
const styles = {
  container: {
    textAlign: "center",
    marginTop: "80px",
  },
  title: {
    color: "#2d3748",
    fontSize: "2rem",
    marginBottom: "16px",
  },
  text: {
    fontSize: "1.1rem",
    color: "#4a5568",
    marginBottom: "24px",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#3182ce",
    color: "white",
    padding: "12px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
  },
};
