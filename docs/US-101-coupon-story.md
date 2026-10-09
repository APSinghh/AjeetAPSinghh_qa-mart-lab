# US-101: Apply a coupon at checkout

As a shopper, I want to apply a coupon at checkout so that I pay less.

## Acceptance criteria
1. Codes are case-insensitive and surrounding spaces are ignored.
2. SAVE10 gives 10% off the subtotal, rounded down to the rupee, capped at ₹200.
3. FLAT100 gives ₹100 off orders of ₹500 or more.
4. WELCOME50 gives 50% off (capped at ₹250) on a shopper's first order only.
5. SUMMER25 has expired and shows "This coupon has expired".
6. Any other code shows "Invalid coupon code".
7. The order summary shows Subtotal, Discount and Total, and Total = Subtotal − Discount.

## Test accounts
- asha@qamart.test / Test@1234: first order (WELCOME50 allowed)
- ravi@qamart.test / Test@1234: returning shopper (WELCOME50 not allowed)
- locked@qamart.test / Test@1234: locked account

## Prices
Wireless Mouse ₹799 · USB-C Cable ₹249 · Test Charter Notebook ₹500 · Desk Lamp ₹1,499 · Coffee Mug ₹350 · Laptop Stand ₹1,999

(This is the Day 1 story, now running in a real app. Day 1 flagged "₹500 inclusive?" as an ambiguity. The PO answered: inclusive.)
