const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, default: '' },
  price: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
