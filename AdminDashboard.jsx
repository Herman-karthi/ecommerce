import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // <--- New State for Orders
  const [view, setView] = useState("products"); // Toggle between "products" and "orders"
  
  // ... (Keep your existing inputs state and helper functions like processImageLink) ...
  const [inputs, setInputs] = useState({ name: "", price: "", quantity: "", image_url: "", delivery_days: "" });
  const [deleteName, setDeleteName] = useState("");
  const navigate = useNavigate();

  // Load Data
  useEffect(() => {
    getProducts();
    getOrders(); // <--- Fetch orders too
  }, []);

  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      setProducts(await res.json());
    } catch (err) { console.error(err); }
  };

  const getOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/orders");
      setOrders(await res.json());
    } catch (err) { console.error(err); }
  };

  // ... (Keep onChange, onSubmitForm, onDeleteProduct same as before) ...
  // (Paste your previous logic here for adding/deleting products)
  const processImageLink = (url) => { /* ... */ return url; };
  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });
  const onSubmitForm = async (e) => { /* ... code from previous step ... */ };
  const onDeleteProduct = async (e) => { /* ... code from previous step ... */ };


  // --- NEW: Function to Approve Order ---
  const handleApproveOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID & APPROVED ✅" })
      });
      if(response.ok) {
        getOrders(); // Refresh list
      }
    } catch (err) { console.error(err); }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f4f9" }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: "20%", backgroundColor: "#2c3e50", color: "white", padding: "20px" }}>
        <h3>Admin Panel</h3>
        <button onClick={() => setView("products")} style={{width: "100%", padding: "10px", margin: "10px 0", cursor: "pointer"}}>Manage Products</button>
        <button onClick={() => setView("orders")} style={{width: "100%", padding: "10px", margin: "10px 0", cursor: "pointer"}}>Customer Orders</button>
        <button onClick={logout} style={{width: "100%", marginTop: "50px", color: "red", cursor: "pointer"}}>Logout</button>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div style={{ width: "80%", padding: "40px", overflowY: "auto" }}>
        
        {/* VIEW 1: PRODUCT MANAGEMENT (Reuse your old code here mostly) */}
        {view === "products" && (
          <div>
             <h1 style={{ color: "#2c3e50" }}>Product Inventory</h1>
             {/* ... PASTE YOUR OLD PRODUCT FORM & GRID HERE ... */}
             <p>(Use the Add/Update Form from previous code here)</p>
             <div className="products-grid">
                {products.map(p => (
                    <div key={p.product_id} className="product-card" style={{width: "150px"}}>
                        <img src={p.image_url} style={{width: "100%", height: "100px"}} />
                        <p>{p.name} <br/> Stock: {p.stock_quantity}</p>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* VIEW 2: ORDER MANAGEMENT (NEW) */}
        {view === "orders" && (
          <div>
            <h1 style={{ color: "#2c3e50" }}>Customer Orders</h1>
            <table style={{width: "100%", borderCollapse: "collapse", background: "white"}}>
                <thead>
                    <tr style={{background: "#ddd", textAlign: "left"}}>
                        <th style={{padding: "10px"}}>Order ID</th>
                        <th style={{padding: "10px"}}>User</th>
                        <th style={{padding: "10px"}}>Product</th>
                        <th style={{padding: "10px"}}>Price</th>
                        <th style={{padding: "10px"}}>Status</th>
                        <th style={{padding: "10px"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.order_id} style={{borderBottom: "1px solid #eee"}}>
                            <td style={{padding: "10px"}}>#{order.order_id}</td>
                            <td style={{padding: "10px"}}>{order.username}</td>
                            <td style={{padding: "10px"}}>{order.product_name}</td>
                            <td style={{padding: "10px"}}>${order.price}</td>
                            <td style={{padding: "10px", fontWeight: "bold", color: order.status.includes("APPROVED") ? "green" : "orange"}}>
                                {order.status}
                            </td>
                            <td style={{padding: "10px"}}>
                                {!order.status.includes("APPROVED") && (
                                    <button 
                                        onClick={() => handleApproveOrder(order.order_id)}
                                        style={{padding: "5px 10px", backgroundColor: "#27ae60", color: "white", border: "none", cursor: "pointer"}}
                                    >
                                        Approve Payment
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;