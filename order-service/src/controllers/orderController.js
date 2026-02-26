const Order = require('../models/Order');
const { fetchProductsByIds } = require('../clients/productClient');

exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const productIds = items.map(i => i.productId);
    let products;
    try {
      products = await fetchProductsByIds(productIds);
    } catch (err) {
      return res.status(502).json({ error: 'Unable to reach product service' });
    }

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    const priceMap = {};
    products.forEach(p => {
      priceMap[p._id] = { price: p.price, name: p.name };
    });

    const orderItems = items.map(item => ({
      productId: item.productId,
      productName: priceMap[item.productId]?.name || '',
      price: priceMap[item.productId]?.price || 0,
      quantity: item.quantity
    }));

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({ items: orderItems, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
