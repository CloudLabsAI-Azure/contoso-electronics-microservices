import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { placeOrder } from '../api';

function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    try {
      const orderItems = items.map(i => ({
        productId: i.product._id,
        quantity: i.quantity
      }));
      const order = await placeOrder(orderItems);
      clearCart();
      navigate(`/order/${order._id}`);
    } catch (err) {
      alert('Failed to place order');
    }
  };

  if (!items.length) {
    return <div className="empty-state"><p>Your cart is empty.</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>🛒 Your Cart</h1>
        <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ product, quantity }) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(product._id, quantity - 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => updateQuantity(product._id, quantity + 1)}>+</button>
                </div>
              </td>
              <td>${(product.price * quantity).toFixed(2)}</td>
              <td><button className="remove-btn" onClick={() => removeFromCart(product._id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <span className="total">Total: ${total.toFixed(2)}</span>
        <button className="btn btn-primary" onClick={handlePlaceOrder}>Place Order</button>
      </div>
    </div>
  );
}

export default Cart;
