const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    size: String,
    color: String,
    emoji: String
  }],
  address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: { type: String, default: 'COD' }, // COD, UPI, CARD
  paymentStatus: { type: String, default: 'pending' }, // pending, paid
  orderStatus: {
    type: String,
    default: 'placed',
    enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']
  },
  subtotal: Number,
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: Number,
  promoCode: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);