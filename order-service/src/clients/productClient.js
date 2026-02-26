const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

async function fetchProductsByIds(ids) {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error(`Product service returned ${res.status}`);
  return res.json();
}

module.exports = { fetchProductsByIds };
