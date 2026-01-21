const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",       // Your Postgres username (default is postgres)
  password: "manisainathreddy", // Your Postgres password
  host: "localhost",
  port: 5432,
  database: "ecommerce" // Your database name
});

module.exports = pool;