import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrder } from '../api';

function OrderConfirm() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="order-confirm">
      <div className="confirm-icon">✅</div>
      <h1>Order Confirmed!</h1>
      <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
      <p className="order-thanks">Thank you for shopping with Contoso Electronics!</p>
      <table className="cart-table" style={{ marginBottom: 20, textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.productName || 'Unknown'}</td>
              <td>{item.quantity}</td>
              <td>{item.price != null ? `$${item.price.toFixed(2)}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total: ${order.totalAmount.toFixed(2)}</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Continue Shopping</Link>
    </div>
  );
}

export default OrderConfirm;
