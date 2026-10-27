# Test case table

Use one row per test. Technique says why the case exists (equivalence class, boundary value, state change, negative).

| ID | Story / AC | Title | Technique | Layer (UI/API) | Preconditions | Steps | Expected | Priority |
|---|---|---|---|---|---|---|---|---|
| TC-001 | US-101 AC3 | FLAT100 at exactly ₹500 | Boundary | API | none | POST /api/coupons/validate with FLAT100 and subtotal 500 | 200 and discount 100 | High |
