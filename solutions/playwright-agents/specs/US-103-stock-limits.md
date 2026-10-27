# US-103 Stock limits: test plan

Fallback plan for the trainer demo, in the format the Playwright planner saves. Seed: `tests/seed.spec.ts` (signed in as the standard shopper on the product list).

## 1. Sold-out products

**Seed:** `tests/seed.spec.ts`

### 1.1 US-103 AC1: sold-out product cannot be added to the cart
**Steps:**
1. On the product list, find the "Laptop Stand" card.
2. Look at the card text and the "Add to cart" button.

**Expected results:**
- The card shows "Out of stock".
- The "Add to cart" button is disabled.

### 1.2 US-103 AC1: in-stock products can be added
**Steps:**
1. On the product list, click "Add to cart" on the "Coffee Mug" card.

**Expected results:**
- The status line says "Coffee Mug added to cart".
- The cart count in the header is 1.

## 2. Order limits (API)

**Seed:** `tests/seed.spec.ts`

### 2.1 US-103 AC2: an order with a sold-out product is rejected
**Steps:**
1. Sign in through `POST /api/login` and keep the token.
2. `POST /api/orders` with one "Laptop Stand" (`p6`).

**Expected results:**
- Status 422 and error "Laptop Stand is out of stock".

### 2.2 US-103 AC3: an order above the stock limit is rejected
**Steps:**
1. Sign in through `POST /api/login` and keep the token.
2. `POST /api/orders` with 4 "Desk Lamp" (`p4`, stock limit 3).

**Expected results:**
- Status 422 and an error that names "Desk Lamp".
- Observed on the current build: status 201 (application bug, B4).

### 2.3 US-103 AC4: an order at exactly the limit is accepted
**Steps:**
1. Sign in through `POST /api/login` and keep the token.
2. `POST /api/orders` with 3 "Desk Lamp".

**Expected results:**
- Status 201 with an `orderId`.
