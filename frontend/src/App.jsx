import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const money = n => `₹${Number(n).toLocaleString("en-IN")}`;
const challenges = [
  { n: "01", title: "Product search", area: "Backend · API", symptom: "Searching for “head” does not show Wireless Headphones, even though the word is in the product name.", expected: "Search should be case-insensitive and match part of a product name.", test: "Try: head, HEAD, watch", tag: "Search" },
  { n: "02", title: "Category filter", area: "Backend · API", symptom: "Selecting Electronics or Fashion still shows the wrong product list (sometimes no products).", expected: "Only products belonging to the selected category should be displayed.", test: "Select Electronics, then Accessories", tag: "Filtering" },
  { n: "03", title: "Cart subtotal", area: "Frontend · React", symptom: "Increase a product quantity to 2 or 3. The subtotal does not multiply the price by quantity.", expected: "Subtotal = sum of (unit price × quantity) for every cart item.", test: "Add headphones and set quantity to 2", tag: "Calculation" },
  { n: "04", title: "Coupon discount", area: "Backend · API", symptom: "Apply SAVE10. The discount is ₹10 instead of 10% of the eligible cart subtotal.", expected: "The API should calculate and return a 10% discount amount.", test: "Add an item, then apply SAVE10", tag: "Pricing" },
  { n: "05", title: "Inventory after checkout", area: "Backend · API", symptom: "Place an order successfully. The product's stock count does not decrease afterward.", expected: "A successful order should reduce stock by the purchased quantity.", test: "Note stock, buy one item, check stock again", tag: "Checkout" }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChallenges, setShowChallenges] = useState(true);

  async function loadProducts() {
    const params = new URLSearchParams({ search, category });
    const res = await fetch(`${API}/products?${params}`);
    const data = await res.json();
    setProducts(data);
  }
  useEffect(() => { loadProducts().catch(() => setNotice("Cannot reach the API. Start the backend on port 4000.")); }, [search, category]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price, 0), [cart]); // BUG 3: quantity is ignored.
  const total = Math.max(0, subtotal - discount);

  function addToCart(product) {
    setCart(old => {
      const found = old.find(x => x.product.id === product.id);
      if (found) return old.map(x => x.product.id === product.id ? { ...x, quantity: Math.min(x.quantity + 1, product.stock) } : x);
      return [...old, { product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your cart`);
  }
  function changeQty(id, qty) {
    setCart(old => old.map(x => x.product.id === id ? { ...x, quantity: Math.max(1, Math.min(Number(qty), x.product.stock)) } : x));
  }
  function removeItem(id) {
    setCart(old => old.filter(x => x.product.id !== id));
  }
  async function applyCoupon() {
    setCouponMessage("");
    try {
      const res = await fetch(`${API}/coupon`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon, items: cart.map(x => ({ productId: x.product.id, quantity: x.quantity })) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDiscount(data.discount);
      setCouponMessage("SAVE10 applied successfully.");
    } catch (e) { setDiscount(0); setCouponMessage(e.message); }
  }
  async function checkout() {
    if (!cart.length) return;
    setLoading(true); setNotice("");
    try {
      const res = await fetch(`${API}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.map(x => ({ productId: x.product.id, quantity: x.quantity })) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotice(`Order ${data.order.id} placed! Refresh products to inspect inventory.`);
      setCart([]); setDiscount(0); setCoupon(""); setCouponMessage("");
      await loadProducts();
    } catch (e) { setNotice(e.message); }
    finally { setLoading(false); }
  }
  async function resetDemo() {
    await fetch(`${API}/reset`, { method: "POST" });
    setCart([]); setDiscount(0); setCoupon(""); setCouponMessage(""); setNotice("Demo data reset."); await loadProducts();
  }

  return <div className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brandmark">D</span> debugmart</a><div className="toplinks"><span>Debugging practice store</span><button className="reset" onClick={resetDemo}>↻ Reset demo</button><a href="#cart" className="cart-link">Bag <b>{cart.reduce((n,x)=>n+x.quantity,0)}</b></a></div></header>
    <main>
      <section className="hero"><div><div className="eyebrow">FULL-STACK DEBUGGING CHALLENGE</div><h1>Find the bugs.<br/><em>Fix the experience.</em></h1><p>A small e-commerce app with five independent bugs across React and Node.js. Reproduce each issue, inspect the code, and fix it.</p><div className="hero-meta"><span>✦ 5 independent bugs</span><span>⌘ React + Node.js</span><span>◷ Beginner → Intermediate</span></div></div><div className="hero-art"><div className="art-circle">🛍️</div><div className="float-card">BUG HUNT <b>05 / 05</b></div><div className="art-caption">Your next fix is hiding in plain sight.</div></div></section>

      {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      <section className="challenge-panel">
        <button className="challenge-head" onClick={()=>setShowChallenges(!showChallenges)}><div><div className="eyebrow">YOUR DEBUGGING TASKS</div><h2>Five things are broken <span className="count">05</span></h2></div><span className="toggle">{showChallenges ? "Hide −" : "Show +"}</span></button>
        {showChallenges && <div className="challenge-grid">{challenges.map(c=><article className="challenge" key={c.n}><div className="challenge-top"><span className="number">{c.n}</span><span className="tag">{c.tag}</span></div><h3>{c.title}</h3><div className="area">{c.area}</div><p><b>Observed:</b> {c.symptom}</p><p className="expected"><b>Expected:</b> {c.expected}</p><div className="test">↳ Reproduce: {c.test}</div></article>)}</div>}
      </section>

      <section className="shop-layout"><div className="catalog"><div className="section-heading"><div><div className="eyebrow">CURATED FOR YOU</div><h2>Explore products</h2></div><span className="muted">{products.length} products</span></div>
        <div className="filters"><div className="searchbox"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." /></div><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option><option>Electronics</option><option>Accessories</option><option>Fashion</option></select></div>
        <div className="product-grid">{products.map(p=><article className="product" key={p.id}><div className="product-image" style={{background:p.color}}><span>{p.emoji}</span><small>{p.category}</small></div><div className="product-info"><div className="rating">★ {p.rating} <span>· {p.stock} in stock</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><b>{money(p.price)}</b><button onClick={()=>addToCart(p)}>+ Add</button></div></div></article>)}</div>
        {!products.length && <div className="empty">No products found. Try another search or category.</div>}
      </div>
      <aside className="cart-panel" id="cart"><div className="cart-title"><div><div className="eyebrow">YOUR SELECTION</div><h2>Your bag <span className="count">{cart.reduce((n,x)=>n+x.quantity,0)}</span></h2></div><span>♧</span></div>
        {!cart.length ? <div className="cart-empty"><div>🛒</div><b>Your bag is waiting</b><p>Add a product to start debugging the checkout flow.</p></div> : <div className="cart-items">{cart.map(x=><div className="cart-item" key={x.product.id}><div className="mini-image" style={{background:x.product.color}}>{x.product.emoji}</div><div className="item-details"><b>{x.product.name}</b><span>{money(x.product.price)}</span><div className="qty"><button onClick={()=>changeQty(x.product.id,x.quantity-1)}>−</button><span>{x.quantity}</span><button onClick={()=>changeQty(x.product.id,x.quantity+1)}>+</button><button className="remove" onClick={()=>removeItem(x.product.id)}>Remove</button></div></div></div>)}</div>}
        <div className="coupon"><label>DISCOUNT CODE</label><div className="coupon-row"><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Try SAVE10"/><button onClick={applyCoupon}>Apply</button></div>{couponMessage && <small>{couponMessage}</small>}</div>
        <div className="totals"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Discount</span><b className="discount">− {money(discount)}</b></div><div className="grand"><span>Total</span><b>{money(total)}</b></div></div>
        <button className="checkout" disabled={!cart.length || loading} onClick={checkout}>{loading ? "Placing order..." : "Place order →"}</button><div className="secure">⌑ Secure demo checkout · No payment required</div>
      </aside></section>
      <footer><span>debugmart <b>·</b> Built for debugging practice</span><span>React frontend / Express API</span></footer>
    </main>
  </div>;
}