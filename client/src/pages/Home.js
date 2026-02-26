import React, { useEffect, useState, useCallback } from 'react';
import { fetchProducts } from '../api';
import { useCart } from '../CartContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = useCallback((p) => {
    addToCart(p);
    setAdded(p._id);
    setTimeout(() => setAdded(null), 1200);
  }, [addToCart]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  if (!products.length) {
    return <div className="empty-state">📦<p>No products yet. Add some from the Admin page.</p></div>;
  }

  return (
    <div>
      <div className="hero">
        <p className="hero-badge">⚡ {products.length} products available</p>
        <h1>Contoso Electronics</h1>
        <p className="hero-sub">Premium tech gear &mdash; curated for professionals.</p>
      </div>
      <div className="section-header">
        <h2>All Products</h2>
      </div>
      <div className="product-grid">
        {products.map(p => (
          <div className="product-card" key={p._id}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} />
            ) : (
              <div className="no-image">
                <span>📦</span>
              </div>
            )}
            <div className="info">
              <h3>{p.name}</h3>
              <p className="desc">{p.description}</p>
              <div className="bottom">
                <span className="price">${p.price.toFixed(2)}</span>
                <button
                  className={`btn btn-primary btn-sm ${added === p._id ? 'btn-added' : ''}`}
                  onClick={() => handleAdd(p)}
                >
                  {added === p._id ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
