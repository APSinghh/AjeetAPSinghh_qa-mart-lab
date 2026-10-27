// Lab accounts. Credentials come from env vars when set, so real secrets never live in code.
export const users = {
  standard: { email: process.env.QA_USER ?? 'asha@qamart.test', password: process.env.QA_PASS ?? 'Test@1234' },
  returning: { email: 'ravi@qamart.test', password: process.env.QA_PASS ?? 'Test@1234' },
  locked: { email: 'locked@qamart.test', password: process.env.QA_PASS ?? 'Test@1234' },
};

export const shipping = {
  fullName: 'Asha Rao',
  mobile: '9876543210',
  address: '12 MG Road, Bengaluru',
  pin: '560001',
};

// Catalogue as of US-101. `stock` is the per-order limit from /api/inventory.
export const products = {
  mouse: { id: 'p1', name: 'Wireless Mouse', price: 799, stock: 10 },
  cable: { id: 'p2', name: 'USB-C Cable', price: 249, stock: 25 },
  notebook: { id: 'p3', name: 'Test Charter Notebook', price: 500, stock: 5 },
  lamp: { id: 'p4', name: 'Desk Lamp', price: 1499, stock: 3 },
  mug: { id: 'p5', name: 'Coffee Mug', price: 350, stock: 40 },
  stand: { id: 'p6', name: 'Laptop Stand', price: 1999, stock: 0 },
};

export const coupons = {
  percent: 'SAVE10',
  flat: 'FLAT100',
  firstOrder: 'WELCOME50',
  expired: 'SUMMER25',
};
