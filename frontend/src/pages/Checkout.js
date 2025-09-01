import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import API from "../services/api";

const stripePromise = loadStripe("pk_test_..."); // your publishable key

const CheckoutForm = () => {
  const { cart, clearCartContext } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const res = await API.post("/checkout", { items: cart.items });
      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          alert("Payment successful!");
          clearCartContext();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "50px auto" }}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading} style={{ marginTop: "20px" }}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;
