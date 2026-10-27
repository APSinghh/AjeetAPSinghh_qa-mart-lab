# US-102: See my order history

As a shopper, I want to see the orders I have placed so that I can check what I paid.

## Acceptance criteria
1. A signed-in shopper reaches the page from the "Orders" link in the main navigation (`/orders`).
2. The page lists only the signed-in shopper's own orders, newest first.
3. Each row shows the order number, number of items, coupon used (or a dash), discount and total.
4. A shopper with no orders sees "You have no orders yet".
5. A shopper who is not signed in is sent to the sign-in page.
6. `GET /api/orders` returns 401 without a sign-in token and only the caller's orders with one.

## Notes
- Order numbers look like `QM-10001` and count up from the last reset.
- Both designs (v1 and v2) expose the same accessible names.
