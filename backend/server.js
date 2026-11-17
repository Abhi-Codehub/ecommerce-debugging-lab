const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const initialProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 2499, stock: 8, rating: 4.6, emoji: "🎧", color: "#e9e7ff", description: "Immersive sound with 30-hour battery life." },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 3999, stock: 5, rating: 4.4, emoji: "⌚", color: "#e1f2ed", description: "Track your activity, sleep and daily goals." },
  { id: 3, name: "Everyday Backpack", category: "Accessories", price: 1499, stock: 12, rating: 4.8, emoji: "🎒", color: "#fff0df", description: "A lightweight backpack for work and travel." },
  { id: 4, name: "Running Shoes", category: "Fashion", price: 2899, stock: 6, rating: 4.5, emoji: "👟", color: "#fce7eb", description: "Comfortable cushioning for everyday runs." },
  { id: 5, name: "Classic Sunglasses", category: "Accessories", price: 999, stock: 10, rating: 4.2, emoji: "🕶️", color: "#e4effb", description: "A clean, versatile frame with UV protection." },
  { id: 6, name: "Cotton Hoodie", category: "Fashion", price: 1799, stock: 7, rating: 4.7, emoji: "🧥", color: "#f4e9df", description: "Soft cotton comfort for cooler days." }
];

let products = structuredClone(initialProducts);
let orders = [];
const COUPON = { code: "SAVE10", percent: 10 };

app.get("/api/products", (req, res) => {
  const { search = "", category = "All" } = req.query;
  let result = [...products];

  // BUG 1: Search is case-sensitive. "head" won't match "Wireless Headphones".
  if (search) result = result.filter(p => p.name.includes(search));

  // BUG 2: The UI sends a category, but this compares against the wrong property.
  if (category !== "All") result = result.filter(p => p.categoryName === category);

  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.post("/api/coupon", (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  if (code !== COUPON.code) return res.status(400).json({ message: "Invalid coupon code" });

  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const cartSubtotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === Number(item.productId));
    return sum + (product ? product.price * Number(item.quantity || 0) : 0);
  }, 0);

  // BUG 4: SAVE10 means 10%, but the API returns 10 as a rupee discount.
  res.json({ code, discount: COUPON.percent, message: "Coupon applied successfully" });
});

app.post("/api/checkout", (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ message: "Your cart is empty" });

  for (const item of items) {
    const product = products.find(p => p.id === Number(item.productId));
    if (!product) return res.status(404).json({ message: "A product no longer exists" });
    if (Number(item.quantity) < 1 || Number(item.quantity) > product.stock) {
      return res.status(400).json({ message: `Not enough stock for ${product.name}` });
    }
  }

  // BUG 5: Order succeeds, but inventory is never reduced after checkout.
  const order = { id: `ORD-${Date.now()}`, items, createdAt: new Date().toISOString() };
  orders.push(order);
  res.status(201).json({ message: "Order placed successfully", order });
});

app.get("/api/orders", (_req, res) => res.json(orders));
app.post("/api/reset", (_req, res) => {
  products = structuredClone(initialProducts);
  orders = [];
  res.json({ message: "Demo data reset" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`E-commerce API running at http://localhost:${PORT}`));