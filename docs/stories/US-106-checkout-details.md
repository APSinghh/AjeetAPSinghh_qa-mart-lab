# US-106: Checkout totals and delivery details

As a shopper, I want a correct order summary and clear form errors so that I can place my order with confidence.

## Acceptance criteria
1. The order summary shows Subtotal, Discount and Total, and Total = Subtotal − Discount.
2. Placing an order with all fields valid goes to the confirmation page with an order number and the amount paid.
3. Empty "Full name" shows "Enter your full name".
4. A mobile number that is not exactly 10 digits shows "Enter a 10-digit mobile number".
5. Empty "Delivery address" shows "Enter your delivery address".
6. A PIN code that is not 6 digits, or starts with 0, shows "Enter a 6-digit PIN code".
7. Each invalid field is marked `aria-invalid="true"` and its message is linked with `aria-errormessage`.
8. An empty cart disables "Place order" and shows "Your cart is empty".

## Notes
- Coupon rules live in US-101. Keep them out of this story's tests unless the Discount line is the point.
