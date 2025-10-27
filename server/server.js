import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: "team4-mysql-server.mysql.database.azure.com", 
  port: 3306,
  user: "pos3380",
  password: "F@@dtruckpos",
  database: "pos",
  ssl: { rejectUnauthorized: false }
  });  


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM staff WHERE Email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    
    const isValid = await bcrypt.compare(password, user.PasswordHash);


    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.json({ message: "Login successful", role: user.Role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});


app.post("/customer-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM customer WHERE Email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Customer not found" });
    }

    const customer = rows[0];

    
    const isValid = await bcrypt.compare(password, customer.PasswordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    
    return res.json({
      message: "Customer login successful",
      name: `${customer.Fname} ${customer.Lname}`,
      customerId: customer.CustomerID,
    });
  } catch (error) {
    console.error("❌ Error during customer login:", error);
    return res.status(500).json({ message: "Server error" });
  }
});



app.listen(4000, () => console.log("✅ Server running on port 4000"));
