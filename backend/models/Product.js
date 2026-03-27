const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true }, // tshirts, hoodies, shirts, etc
  sizes: [String],
  colors: [String],
  emoji: { type: String, default: '👕' },
  image: { type: String },
  description: { type: String },
  rating: { type: Number, default: 4.0 },
  reviews: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  badge: { type: String }, // NEW, SALE, etc
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);