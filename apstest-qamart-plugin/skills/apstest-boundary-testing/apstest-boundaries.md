# Boundary Matrix

| Story / AC | Inputs | Expected |
| --- | --- | --- |
| US-101 AC1 | SAVE10 with lowercase and surrounding spaces | Same discount as SAVE10 |
| US-101 AC2 | Subtotals 9, 10, 1999, 2000, 2001 | Floor 10 percent, at most 200 rupees |
| US-101 AC3 | FLAT100 at 499, 500, 501 | Reject, discount 100, discount 100 |
| US-101 AC4 | WELCOME50 for first and returning shoppers; reuse after order | First only, capped at 250 |
| US-101 AC5-6 | SUMMER25 and unknown code | Exact story error message |
| US-101 AC7 | Discounted checkout | Total equals subtotal minus discount |
| US-103 AC1-2 | Laptop Stand with zero stock | Disabled UI button; API 422 naming product |
| US-103 AC3-5 | Read inventory; order limit-1, limit, limit+1 | Accept, accept, 422 naming product |
| US-105 AC1 | Order without token | 401 and no new order |
| US-105 AC2 | Valid token for another email | 403 |
| US-105 AC3 | Matching email and token | 201 with orderId and correct totals |
| US-105 AC4 | Two fresh login tokens | Assess unpredictability separately; distinct strings alone do not prove it |

Derive stock limits and valid product IDs from shared test data and inventory.
Use a private app instance for order-state or coupon-reuse checks. Global reset
is unsafe against another worker or a shared classroom server.
FLAT100 exactly at 500 and stock limit+1 are known training defect candidates;
verify actual output, but keep the story-based expectation unchanged.