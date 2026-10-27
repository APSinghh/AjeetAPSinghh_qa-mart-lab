# US-105: Only signed-in shoppers can order

As the shop owner, I want orders to come only from signed-in shoppers so that nobody can place orders in someone else's name.

## Acceptance criteria
1. `POST /api/orders` without an `Authorization: Bearer <token>` header returns 401 and creates no order.
2. A token that does not match the `email` in the order body returns 403.
3. A valid token for the same email creates the order and returns 201 with `orderId`, `subtotal`, `discount` and `total`.
4. A token is issued by `POST /api/login` and is not guessable.

## Notes
- This story is about the API. The UI already sends the order from a signed-in session.
- Treat any finding here as a security defect, not a cosmetic one.
