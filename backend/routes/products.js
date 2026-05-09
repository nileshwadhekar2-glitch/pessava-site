const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { reviews: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/seed/add', async (req, res) => {
  try {
    const dummyProducts = [
      { name: 'Acid Wash Oversized Drop-Shoulder Tee', brand: 'PESSAVA Originals', price: 699, originalPrice: 999, category: 'tshirts', sizes: ['S','M','L','XL'], colors: ['Black','White','Red'], emoji: '👕', rating: 4.3, reviews: 812, badge: 'SALE' },
      { name: 'Terry Fleece Zip-Up Hoodie', brand: 'Street Lab', price: 1299, originalPrice: 1799, category: 'hoodies', sizes: ['S','M','L'], colors: ['Charcoal','Navy'], emoji: '🧥', rating: 4.8, reviews: 1200, badge: 'NEW' },
      { name: '6-Pocket Utility Cargo Trousers', brand: 'Cargopunk', price: 1099, originalPrice: 1599, category: 'trousers', sizes: ['28','30','32','34'], colors: ['Olive','Black'], emoji: '👖', rating: 4.2, reviews: 543, badge: 'SALE' },
      { name: 'Embroidered Logo Snapback Cap', brand: 'PESSAVA Originals', price: 499, originalPrice: 699, category: 'accessories', sizes: ['Free Size'], colors: ['Black','White'], emoji: '🧢', rating: 4.9, reviews: 329, badge: 'NEW' },
      { name: 'Anime Print Regular Fit Cotton Tee', brand: 'GraphX', price: 549, originalPrice: 799, category: 'tshirts', sizes: ['S','M','L','XL','XXL'], colors: ['White','Black'], emoji: '👕', rating: 4.4, reviews: 2100 },
      { name: 'Relaxed Fit Cuban Collar Linen Shirt', brand: 'Street Lab', price: 899, originalPrice: 1299, category: 'shirts', sizes: ['S','M','L','XL'], colors: ['White','Beige'], emoji: '👔', rating: 4.1, reviews: 487, badge: 'SALE' },
      { name: 'Dry-Fit Training Sleeveless Vest', brand: 'PESSAVA Sport', price: 399, originalPrice: 599, category: 'tshirts', sizes: ['S','M','L','XL'], colors: ['Black','Grey'], emoji: '🩱', rating: 4.7, reviews: 903, badge: 'NEW' },
      { name: 'Nylon Crossbody Sling Bag', brand: 'Cargopunk', price: 799, originalPrice: 1199, category: 'accessories', sizes: ['One Size'], colors: ['Black'], emoji: '🎒', rating: 4.3, reviews: 671, badge: 'SALE' },
    ];
    await Product.insertMany(dummyProducts);
    res.json({ success: true, message: '8 products added!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;