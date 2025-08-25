import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products"); // now API is defined
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Products</h1>
      <div style={{
        display: "grid",
        gap: "20px",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))"
      }}>
        {products.map((product) => (
          <div key={product.id} 
          onClick={() => navigate(`/products/${product.id}`)}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "8px",
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            >
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>${product.price}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
