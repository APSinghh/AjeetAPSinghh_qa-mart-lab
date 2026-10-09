// QA Mart front end. One script for every page; the page is picked from <body data-page>.
(function () {
  const isV2 = document.documentElement.dataset.ui === 'v2';
  const CLASS_MAP = { topbar: 'shell', btn: 'button', 'btn-primary': 'button--cta', 'btn-ghost': 'button--quiet', 'btn-link': 'button--text',
    'cart-badge': 'pill', card: 'panel', 'form-row': 'field', 'product-grid': 'tiles', 'product-card': 'tile', 'cart-table': 'basket', price: 'tile__price' };
  const cls = (names) => (isV2 ? names.split(' ').map((n) => CLASS_MAP[n] || n).join(' ') : names);
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const read = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } };

  const session = () => read('qm_session', null);
  const cart = () => read('qm_cart', {});
  const saveCart = (c) => { write('qm_cart', c); updateBadge(); };
  const cartCount = (c = cart()) => Object.values(c).reduce((a, b) => a + b, 0);

  async function api(path, body) {
    const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }
  async function products() {
    const cached = read('qm_products', null);
    if (cached) return cached;
    const { ok, data } = await api('/api/products');
    if (!ok) throw new Error('Could not load products');
    write('qm_products', data.products);
    return data.products;
  }

  // v2: rename classes and ids on static markup, keep labels pointing at the right inputs.
  function applyV2() {
    if (!isV2) return;
    document.querySelectorAll('[class]').forEach((el) => { el.className = cls(el.className); });
    document.querySelectorAll('[data-v2-id]').forEach((el) => {
      const old = el.id; el.id = el.dataset.v2Id;
      if (old) document.querySelectorAll(`label[for="${old}"]`).forEach((l) => { l.htmlFor = el.id; });
    });
    document.querySelectorAll('button[data-v2-wrap]').forEach((b) => { const s = document.createElement('span'); b.replaceWith(s); s.appendChild(b); });
  }

  function updateBadge() {
    const badge = document.querySelector('[data-testid="cart-count"]');
    if (badge) badge.textContent = String(cartCount());
  }

  function requireSession() {
    const s = session();
    if (!s) { location.replace('/login'); return null; }
    const g = document.querySelector('[data-testid="greeting"]');
    if (g) g.textContent = 'Hi, ' + s.name.split(' ')[0];
    const out = document.getElementById('logout') || document.getElementById('signout');
    if (out) out.addEventListener('click', () => { localStorage.removeItem('qm_session'); localStorage.removeItem('qm_cart'); location.assign('/login'); });
    updateBadge();
    return s;
  }

  function setError(input, message) {
    const err = document.getElementById(input.getAttribute('aria-errormessage'));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) { err.textContent = message || ''; err.hidden = !message; }
    return !message;
  }

  const pages = {
    login() {
      const form = document.getElementById('login-form');
      const alertBox = document.querySelector('[role="alert"]');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.hidden = true;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        if (!email || !password) { alertBox.textContent = 'Enter your email and password'; alertBox.hidden = false; return; }
        const { ok, data } = await api('/api/login', { email, password });
        if (!ok) { alertBox.textContent = data.error || 'Sign in failed'; alertBox.hidden = false; return; }
        write('qm_session', data);
        location.assign('/products');
      });
    },

    async products() {
      if (!requireSession()) return;
      const list = document.querySelector('[aria-label="Products"]');
      const status = document.getElementById('products-status');
      const toast = document.querySelector('[data-testid="toast"]');
      // Always fetch here so the page shows the slow-loading behaviour.
      localStorage.removeItem('qm_products');
      let items;
      try { items = await products(); } catch { status.textContent = 'Could not load products. Refresh the page.'; return; }
      if (isV2) items = [...items].reverse();
      list.innerHTML = items.map((p) => isV2
        ? `<li class="tile"><div class="tile__body"><h2>${esc(p.name)}</h2><p class="tile__price">${money(p.price)}</p></div><div class="tile__actions"><button type="button" class="button button--cta" data-id="${p.id}">Add to cart</button></div></li>`
        : `<li class="product-card"><h2>${esc(p.name)}</h2><p class="price">${money(p.price)}</p><button type="button" class="btn btn-primary" data-id="${p.id}">Add to cart</button></li>`).join('');
      status.hidden = true;
      list.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-id]');
        if (!btn) return;
        const c = cart(); c[btn.dataset.id] = (c[btn.dataset.id] || 0) + 1; saveCart(c);
        const p = items.find((x) => x.id === btn.dataset.id);
        toast.textContent = `${p.name} added to cart`;
      });
    },

    async cart() {
      if (!requireSession()) return;
      const items = await products();
      const tbody = document.querySelector('tbody');
      const empty = document.getElementById('cart-empty');
      const table = document.querySelector('table');
      const checkout = document.querySelector('[data-action="checkout"]');
      function render() {
        const c = cart();
        const rows = Object.entries(c).map(([id, qty]) => ({ p: items.find((x) => x.id === id), qty })).filter((r) => r.p);
        empty.hidden = rows.length > 0; table.hidden = rows.length === 0; checkout.disabled = rows.length === 0;
        tbody.innerHTML = rows.map(({ p, qty }) => `<tr>
          <th scope="row">${esc(p.name)}</th><td>${money(p.price)}</td>
          <td><span class="qty"><button type="button" class="${cls('btn')}" data-dec="${p.id}" aria-label="Decrease quantity of ${esc(p.name)}">−</button>
          <span data-testid="qty-${p.id}">${qty}</span>
          <button type="button" class="${cls('btn')}" data-inc="${p.id}" aria-label="Increase quantity of ${esc(p.name)}">+</button></span></td>
          <td>${money(p.price * qty)}</td>
          <td><button type="button" class="${cls('btn btn-link')}" data-remove="${p.id}" aria-label="Remove ${esc(p.name)}">Remove</button></td></tr>`).join('');
        const subtotal = rows.reduce((a, r) => a + r.p.price * r.qty, 0);
        document.querySelector('[data-testid="cart-subtotal"]').textContent = money(subtotal);
      }
      tbody.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const c = cart();
        if (b.dataset.inc) c[b.dataset.inc] += 1;
        if (b.dataset.dec) { c[b.dataset.dec] -= 1; if (c[b.dataset.dec] < 1) delete c[b.dataset.dec]; }
        if (b.dataset.remove) delete c[b.dataset.remove];
        saveCart(c); render();
      });
      checkout.addEventListener('click', () => location.assign('/checkout'));
      render();
    },

    async checkout() {
      const s = requireSession(); if (!s) return;
      const items = await products();
      const c = cart();
      const rows = Object.entries(c).map(([id, qty]) => ({ p: items.find((x) => x.id === id), qty })).filter((r) => r.p);
      const subtotal = rows.reduce((a, r) => a + r.p.price * r.qty, 0);
      let discount = 0; let coupon = '';
      const out = (id, v) => { document.querySelector(`[data-testid="${id}"]`).textContent = money(v); };
      const paint = () => { out('order-subtotal', subtotal); out('order-discount', discount); out('order-total', subtotal - discount); };
      paint();
      const place = document.querySelector('[data-action="place-order"]');
      if (!rows.length) { place.disabled = true; document.getElementById('checkout-empty').hidden = false; }

      const couponInput = document.querySelector('[name="coupon"]');
      const couponMsg = document.querySelector('[data-testid="coupon-message"]');
      document.querySelector('[data-action="apply-coupon"]').addEventListener('click', async () => {
        const { ok, data } = await api('/api/coupons/validate', { code: couponInput.value, subtotal, email: s.email });
        couponMsg.textContent = data.message || data.error || 'Could not apply coupon';
        couponMsg.classList.toggle('bad', !ok);
        discount = ok ? data.discount : 0; coupon = ok ? data.code : '';
        paint();
      });

      const f = (name) => document.querySelector(`[name="${name}"]`);
      document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const checks = [
          setError(f('fullName'), f('fullName').value.trim() ? '' : 'Enter your full name'),
          setError(f('mobile'), /^\d{10}$/.test(f('mobile').value.trim()) ? '' : 'Enter a 10-digit mobile number'),
          setError(f('address'), f('address').value.trim() ? '' : 'Enter your delivery address'),
          setError(f('pin'), /^[1-9]\d{5}$/.test(f('pin').value.trim()) ? '' : 'Enter a 6-digit PIN code'),
        ];
        if (checks.includes(false)) return;
        place.disabled = true;
        const { ok, data } = await api('/api/orders', { email: s.email, coupon, items: rows.map((r) => ({ id: r.p.id, qty: r.qty })) });
        if (!ok) { couponMsg.textContent = data.error || 'Order failed'; couponMsg.classList.add('bad'); place.disabled = false; return; }
        write('qm_last_order', data);
        localStorage.removeItem('qm_cart');
        location.assign('/confirmation');
      });
    },

    confirmation() {
      if (!requireSession()) return;
      const order = read('qm_last_order', null);
      if (!order) { document.querySelector('h1').textContent = 'No recent order'; return; }
      document.querySelector('[data-testid="order-id"]').textContent = order.orderId;
      document.querySelector('[data-testid="order-paid"]').textContent = money(order.total);
      document.getElementById('order-details').hidden = false;
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyV2();
    const page = document.body.dataset.page;
    if (pages[page]) pages[page]();
  });
})();
