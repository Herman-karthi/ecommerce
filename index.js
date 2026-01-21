const express = require("express");
const pool = require("./db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const SECRET_KEY = "my_secret_key"; // Change this in production

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
//               USER ROUTES
// ==========================================

// --- USER REGISTER ---
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // Hash Password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Insert User
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, bcryptPassword]
    );

    // Generate Token
    const token = jwt.sign({ user_id: newUser.rows[0].user_id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- USER LOGIN ---
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // Check Password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // Generate Token
    const token = jwt.sign({ user_id: user.rows[0].user_id, role: 'user' }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
//              ADMIN ROUTES
// ==========================================

// --- ADMIN REGISTER (Run once via Postman to create admin) ---
app.post("/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hash Admin Password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Insert Admin
    const newAdmin = await pool.query(
      "INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, bcryptPassword]
    );
    res.json(newAdmin.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ADMIN LOGIN ---
app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check Admins Table
    const admin = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

    if (admin.rows.length === 0) {
      return res.status(401).json("Invalid Admin Credentials");
    }

    // Check Password
    const validPassword = await bcrypt.compare(password, admin.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Invalid Admin Credentials");
    }

    // Generate Admin Token
    const token = jwt.sign({ admin_id: admin.rows[0].admin_id, role: 'admin' }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- ADMIN: GET ALL ORDERS ---
app.get("/admin/orders", async (req, res) => {
  try {
    const allOrders = await pool.query(
      "SELECT orders.*, users.username FROM orders JOIN users ON orders.user_id = users.user_id ORDER BY order_id DESC"
    );
    res.json(allOrders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ADMIN: APPROVE ORDER ---
app.put("/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "Paid & Verified"
    
    await pool.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2",
      [status, id]
    );
    
    res.json("Order Status Updated!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
app.get("/products", async (req, res) => {
  try {
    // Select all products and order them by ID
    const allProducts = await pool.query("SELECT * FROM products ORDER BY product_id ASC");
    
    // Send the rows back to the frontend
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ADMIN ADD/UPDATE PRODUCT ---
app.post("/admin/products", async (req, res) => {
  try {
    // 1. Get delivery_days from the body (Default to 5 if not provided)
    const { name, price, quantity, image_url, delivery_days } = req.body;
    
    // Check if product exists
    const checkProduct = await pool.query(
      "SELECT * FROM products WHERE name = $1 AND image_url = $2", 
      [name, image_url]
    );

    if (checkProduct.rows.length > 0) {
      // 2. EXIST? Update Quantity AND Delivery Days
      const currentQty = checkProduct.rows[0].stock_quantity;
      const newQty = parseInt(currentQty) + parseInt(quantity);
      
      const updateProduct = await pool.query(
        "UPDATE products SET stock_quantity = $1, delivery_days = $2 WHERE product_id = $3 RETURNING *",
        [newQty, delivery_days || 5, checkProduct.rows[0].product_id]
      );
      
      return res.json({ message: "Product Updated! Stock & Delivery Info saved.", product: updateProduct.rows[0] });

    } else {
      // 3. NOT EXIST? Insert New Product with Delivery Days
      const newProduct = await pool.query(
        "INSERT INTO products (name, price, stock_quantity, image_url, delivery_days) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, price, quantity, image_url, delivery_days || 5]
      );
      
      return res.json({ message: "New Product added successfully!", product: newProduct.rows[0] });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ADMIN DELETE PRODUCT ---
app.delete("/admin/products/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    // Check if it exists first
    const checkProduct = await pool.query("SELECT * FROM products WHERE name = $1", [name]);
    
    if (checkProduct.rows.length === 0) {
      return res.status(404).json("Product not found");
    }

    // Delete it
    await pool.query("DELETE FROM products WHERE name = $1", [name]);
    
    res.json("Product deleted successfully!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- USER: GET MY ORDERS ---
app.get("/orders", async (req, res) => {
  try {
    // Note: We get the user_id from the header (in a real app, use middleware)
    const { user_id } = req.headers;
    const orders = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_id DESC", 
      [user_id]
    );
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- USER: BUY PRODUCT (Simulate Payment) ---
app.post("/buy", async (req, res) => {
  try {
    const { user_id, product_id, product_name, price, delivery_days } = req.body;

    // 1. Transaction Start (Safety Check)
    await pool.query("BEGIN");

    // 2. Check Stock Again (Prevent race conditions)
    const checkStock = await pool.query("SELECT stock_quantity FROM products WHERE product_id = $1 FOR UPDATE", [product_id]);
    
    if (checkStock.rows[0].stock_quantity <= 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json("Sorry! Item just went out of stock.");
    }

    // 3. Deduct Stock
    await pool.query("UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = $1", [product_id]);

    // 4. Calculate Delivery Date (Postgres syntax: CURRENT_DATE + interval)
    // We create the order
    const newOrder = await pool.query(
      `INSERT INTO orders (user_id, product_name, price, delivery_date) 
       VALUES ($1, $2, $3, CURRENT_DATE + make_interval(days => $4)) 
       RETURNING *`,
      [user_id, product_name, price, delivery_days]
    );

    await pool.query("COMMIT");
    
    res.json({ message: "Payment Successful! Order Placed.", order: newOrder.rows[0] });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});