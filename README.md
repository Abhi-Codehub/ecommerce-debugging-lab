# DebugMart — Full-stack E-commerce Debugging Lab

A single e-commerce application containing **5 independent, intentionally introduced bugs**. It uses React + Vite on the frontend and Node.js + Express on the backend. No database, API key, or payment gateway is required.

## Run it

Requirements: Node.js 18+ and npm.

### 1. Start the backend

Open a terminal at the project root:

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:4000`.

### 2. Start the frontend

Open a **second terminal** at the project root:

```bash
cd backend
npm install
npm run dev
```

Open `http://localhost:5173`.

Keep both terminals running.

## The five independent bugs

The app itself displays each challenge, its observed behaviour, expected behaviour, and a reproduction step. These are intentionally separate so fixing one does not fix the others.

| # | Area | File | Reproduction |
|---|---|---|---|
| 1 | Backend product search | `backend/server.js` | Search `head`, then `HEAD`. |
| 2 | Backend category filter | `backend/server.js` | Select Electronics or Accessories. |
| 3 | Frontend cart subtotal | `frontend/src/App.jsx` | Add an item and increase quantity to 2. |
| 4 | Backend coupon calculation | `backend/server.js` | Add an item and apply `SAVE10`. |
| 5 | Backend inventory update | `backend/server.js` | Note stock, place an order, then inspect stock. |

### Expected behaviour

1. Search should match partial product names without case sensitivity.
2. Category selection should show only products in that category.
3. Subtotal should be the sum of `price × quantity` for each cart line.
4. `SAVE10` should apply a 10% discount to the subtotal.
5. Successful checkout should reduce stock by the purchased quantity.

## Suggested interview exercise

1. Ask the candidate to reproduce the issue.
2. Let them inspect the frontend and backend.
3. Ask them to explain the root cause before changing code.
4. Keep each fix focused (ideally 4–5 changed lines).
5. Ask for one edge case or test after each fix.

## Resetting the demo

Click **Reset demo** in the app. This resets in-memory products and orders on the backend. Restarting the backend also resets the data.

## API endpoints

- `GET /api/products?search=&category=`
- `GET /api/products/:id`
- `POST /api/coupon` with `{ "code": "SAVE10", "items": [{ "productId": 1, "quantity": 2 }] }`
- `POST /api/checkout` with `{ "items": [{ "productId": 1, "quantity": 2 }] }`
- `GET /api/orders`
- `POST /api/reset`

## Notes

- Data is stored in memory only and resets when the backend restarts.
- This is a debugging exercise, not production commerce software.
- The payment step is simulated; no real payment is taken.
