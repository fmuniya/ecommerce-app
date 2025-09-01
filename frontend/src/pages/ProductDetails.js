import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams(); // Get product id from route
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product details");
      }
    };

    fetchProduct();
  }, [id]);

  if (error)
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );

  if (!product)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <button
        onClick={() => navigate(-1)}
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
        ← Back
      </button>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        {/* Product Image */}
        <div style={{ flex: 1 }}>
          <img
            src={product.imageUrl || "https://placehold.co/400"}
            alt={product.name}
            style={{
              width: "100%",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Product Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 style={{ marginBottom: "15px" }}>{product.name}</h2>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Price:</strong>{" "}
            <span style={{ color: "#28a745", fontWeight: "bold" }}>
              ${product.price}
            </span>
          </p>
          <p style={{ marginBottom: "10px" }}>
            <strong>Category:</strong> {product.category}
          </p>
          <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
            {product.description}
          </p>

          <button
            onClick={() => addToCart(product.id, 1)}
            style={{
              marginTop: "auto",
              padding: "12px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#007bff",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              transition: "0.2s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.background = "#0056b3")}
            onMouseOut={(e) => (e.target.style.background = "#007bff")}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
