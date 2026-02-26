import React, { useState, useEffect } from 'react';
import { createProduct, fetchProducts, deleteProduct } from '../api';

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = () => {
    fetchProducts().then(setProducts).catch(console.error);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProduct({ ...form, price: parseFloat(form.price) });
      setForm({ name: '', description: '', price: '', imageUrl: '' });
      loadProducts();
    } catch (err) {
      alert('Failed to create product');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p className="page-subtitle">Manage your Contoso Electronics catalog</p>
      </div>
      <div className="form-card">
        <h3>Add New Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      <div className="section-header" style={{ marginTop: 36 }}>
        <h2>Existing Products ({products.length})</h2>
      </div>
      {products.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No products yet.</p>
      ) : (
        <table className="cart-table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;
