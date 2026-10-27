# US-104: Sign in and locked accounts

As a shopper, I want to sign in with my email and password so that I can shop under my own account.

## Acceptance criteria
1. Valid credentials take the shopper to the product list and the header greets them by first name.
2. A wrong password shows "Invalid email or password" and keeps the shopper on the sign-in page. The API returns 401.
3. An empty email or password shows "Enter your email and password" without calling the API.
4. A locked account shows "This account is locked. Contact support." The API returns 423.
5. The email is not case-sensitive and surrounding spaces are ignored.
6. Signing out clears the cart and returns to the sign-in page.

## Test accounts
See `tests/test-data.ts`. The locked account is `locked@qamart.test`.
