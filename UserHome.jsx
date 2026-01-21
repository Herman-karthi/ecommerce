import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import QRious from "qrious"; // Ensure you installed this: npm install qrious
import "./Home.css"; // We reuse the styles

const UserHome = ({ setAuth }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  
  // Payment Modal State
  const [isPaying, setIsPaying] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qrDataURL, setQrDataURL] = useState("");
  const [txnId, setTxnId] = useState(""); // Stores user's UTR / Transaction ID

  // --- CONFIG: REPLACE WITH YOUR REAL UPI ID ---
  const MY_UPI_ID = "karthikeya@ybl"; // Example: yourname@oksbi
  const MY_NAME = "ShopEase Store";

  // --- 1. Load User Info & Data ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
      fetchOrders(decoded.user_id);
    }
    fetchProducts();
  }, []);

  // --- 2. Helper Functions ---
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/orders", {
        headers: { user_id: id }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const getDeliveryDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toDateString(); 
  };

  // --- 3. Payment Start: Generate QR Code ---
  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setTxnId(""); // Reset previous ID if any
    
    // Create Real UPI Link
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${MY_NAME}&am=${product.price}&tn=Order_${product.product_id}`;

    // Generate QR Image
    const qr = new QRious({
      value: upiLink,
      size: 200,
      level: 'H'
    });

    setQrDataURL(qr.toDataURL());
    setIsPaying(true);
  };

  // --- 4. Payment Confirm: User Submits UTR ---
  const confirmPayment = async () => {
    if (!txnId) {
      alert("Please enter the Transaction ID / UTR from your UPI App to verify payment!");
      return;
    }

    try {
      const body = {
        user_id: userId,
        product_id: selectedProduct.product_id,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        delivery_days: selectedProduct.delivery_days
        // Status defaults to "Ordered" (Pending) in DB, or we could send explicit status
      };

      const res = await fetch("http://localhost:5000/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await res.json();

      if (res.ok) {
        alert(`Order Placed Successfully! \n\nTransaction ID: ${txnId} \nStatus: Pending Verification.\n\nThe Admin will approve your order shortly.`);
        setIsPaying(false);
        setTxnId("");
        fetchOrders(userId); // Refresh the order list
        fetchProducts(); // Update stock quantity
      } else {
        alert(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar" style={{backgroundColor: "#27ae60"}}>
        <div className="nav-logo">ShopEase (Logged In)</div>
        <button onClick={() => { localStorage.removeItem("token"); setAuth(false); }} className="nav-btn" style={{backgroundColor: "#e74c3c", color: "white"}}>
          Logout
        </button>
      </nav>

      <div style={{ display: "flex", padding: "20px", flexDirection: "row", flexWrap: "wrap" }}>
        
        {/* --- LEFT: PRODUCT FEED --- */}
        <div style={{ flex: 2, minWidth: "300px", paddingRight: "20px" }}>
          <h2>Exclusive Products</h2>
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.product_id} className="product-card">
                <img src={p.image_url} alt={p.name} className="product-img" />
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
                    <span className="product-price">${p.price}</span>
                    <small style={{color: "#555"}}>Delivers by: <br/> <b>{getDeliveryDate(p.delivery_days)}</b></small>
                  </div>
                  
                  {p.stock_quantity > 0 ? (
                    <button className="btn-add" style={{backgroundColor: "#27ae60", width: "100%"}} onClick={() => handleBuyClick(p)}>
                      Buy Now
                    </button>
                  ) : (
                    <div style={{ color: "red", fontWeight: "bold" }}>Out of Stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: MY ORDERS --- */}
        <div style={{ flex: 1, minWidth: "250px", borderLeft: "1px solid #ddd", paddingLeft: "20px" }}>
          <h2 style={{color: "#2c3e50"}}>My Orders</h2>
          {orders.length === 0 ? <p>No orders yet!</p> : (
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
              {orders.map((order) => (
                <div key={order.order_id} style={{padding: "15px", background: "white", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)"}}>
                  <strong>{order.product_name}</strong>
                  <div style={{fontSize: "14px", color: "#555", marginTop: "5px"}}>
                    Price: ${order.price}
                  </div>
                  
                  {/* Status Indicator */}
                  <div style={{
                      marginTop: "8px", padding: "5px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
                      backgroundColor: order.status.includes("APPROVED") ? "#e8f8f5" : "#fff3cd",
                      color: order.status.includes("APPROVED") ? "#27ae60" : "#d35400"
                  }}>
                    Status: {order.status}
                  </div>

                  {order.status.includes("APPROVED") && (
                    <div style={{fontSize: "12px", color: "#7f8c8d", marginTop: "5px"}}>
                        Arriving on: {new Date(order.delivery_date).toDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- PAYMENT MODAL --- */}
      {isPaying && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{background: "white", padding: "30px", borderRadius: "10px", textAlign: "center", width: "400px"}}>
            <h2 style={{color: "#5f259f", margin: 0}}>Step 1: Scan & Pay</h2>
            <p style={{marginBottom: "10px"}}>Amount: <b>${selectedProduct.price}</b></p>
            
            <div style={{margin: "10px auto", padding: "5px", border: "2px solid #5f259f", width: "fit-content", borderRadius: "5px"}}>
                <img src={qrDataURL} alt="QR Code" style={{width: "150px"}}/>
            </div>
            
            <p style={{fontSize: "12px", color: "#666"}}>Scan using PhonePe, GPay, or Paytm</p>

            <h3 style={{color: "#333", marginTop: "20px", marginBottom: "5px"}}>Step 2: Enter Receipt</h3>
            <p style={{fontSize: "12px", color: "red", margin: 0}}>* Enter the UTR / Transaction ID from your App</p>
            
            <input 
              type="text" 
              placeholder="Ex: T230121123456" 
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              style={{width: "80%", padding: "10px", marginTop: "10px", border: "1px solid #ccc", borderRadius: "5px"}}
            />

            <div style={{display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px"}}>
                <button 
                  onClick={confirmPayment}
                  style={{padding: "10px 20px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}
                >
                  Submit Order
                </button>
                
                <button 
                  onClick={() => setIsPaying(false)}
                  style={{padding: "10px 20px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}
                >
                  Cancel
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserHome;