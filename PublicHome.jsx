import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const PublicHome = () => {
  const [products, setProducts] = useState([]);
  // 1. New State for Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        const jsonData = await response.json();
        setProducts(jsonData);
      } catch (err) {
        console.error(err.message);
      }
    };

    getProducts();
  }, []);

  // 2. Filter Logic: Create a new list based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">shoppy</div>
        
        {/* 3. Search Input Field */}
        <input 
            type="text" 
            className="search-bar" 
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div>
          <Link to="/login" className="nav-btn">Sign In / Login</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="home-container">
        <h1>Featured Products</h1>
        <p>Login to start shopping with exclusive deals!</p>

        {/* 4. Product Grid (Using filteredProducts instead of products) */}
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.product_id} className="product-card">
                <img src={product.image_url} alt={product.name} className="product-img" />
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <span className="product-price">${product.price}</span>
                  
                  {product.stock_quantity > 0 ? (
                    <button 
                      className="btn-add" 
                      onClick={() => alert("Please Login to purchase items!")}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
                      Currently Unavailable
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // 5. Friendly message if no products match
            <p>No products found matching "{searchQuery}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicHome;