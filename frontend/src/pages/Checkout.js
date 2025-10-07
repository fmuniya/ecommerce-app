import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import API from "../services/api";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY); // your publishable key


const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "Arial, sans-serif",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: { color: "#fa755a" },
  },
};

const CheckoutForm = () => {
  const { cart, clearCartContext } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/checkout/create-payment-intent", 
        { items: cart.items },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
      );
      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        clearCartContext();
        navigate("/success");
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Checkout</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Card Details</label>
        <div style={styles.cardElementWrapper}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <button type="submit" disabled={!stripe || loading} style={styles.button}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
        <button
          type="button"
          style={{ ...styles.button, backgroundColor: "#6c757d", marginTop: "10px" }}
          onClick={() => (window.location.href = "/products")}
        >
          Continue Shopping
        </button>
      </form>
    </div>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;

// Styling
const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  heading: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "500",
    fontSize: "14px",
    color: "#4a5568",
  },
  cardElementWrapper: {
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "6px",
    marginBottom: "20px",
    backgroundColor: "#f9fafb",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#3182ce",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
};
