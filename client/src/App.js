import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './CartContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import OrderConfirm from './pages/OrderConfirm';

function Navbar() {
  const { count } = useCart();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">⚡</span> Contoso Electronics
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Products</Link>
          <Link to="/admin" className={isActive('/admin')}>Admin</Link>
          <Link to="/cart" className={`cart-link ${isActive('/cart')}`}>
            🛒 Cart{count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>© {new Date().getFullYear()} Contoso Electronics. All rights reserved.</span>
        <span className="footer-tagline">Microservices Edition — The app built for demo and lab purposes</span>
      </div>
    </footer>
  );
}

function App() {
  return (
    <CartProvider>
      <Navbar />
      <div className="container page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order/:id" element={<OrderConfirm />} />
        </Routes>
      </div>
      <Footer />
    </CartProvider>
  );
}

export default App;
