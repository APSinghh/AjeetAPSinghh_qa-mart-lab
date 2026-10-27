# US-103: Stock limits

As a shopper, I want to know when something is unavailable so that I do not order what cannot be delivered.

## Acceptance criteria
1. A product with no stock shows "Out of stock" and its "Add to cart" button is disabled.
2. An order that includes a product with no stock is rejected with 422 and "<product name> is out of stock".
3. An order with more units of one product than its stock limit is rejected with 422 and a message that names the product.
4. An order at exactly the stock limit is accepted.
5. `GET /api/inventory` returns the stock limit per product id.

## Data
| Product | Stock limit |
|---|---|
| Wireless Mouse | 10 |
| USB-C Cable | 25 |
| Test Charter Notebook | 5 |
| Desk Lamp | 3 |
| Coffee Mug | 40 |
| Laptop Stand | 0 |
