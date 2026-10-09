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
