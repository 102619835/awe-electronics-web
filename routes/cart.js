const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

router.post('/add/:id', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.quantity < 1) return res.redirect('/products');
  if (!req.session.cart) req.session.cart = [];
  const cart = req.session.cart;
  const existing = cart.find(item => item.product == req.params.id);
  if (existing) existing.quantity++;
  else cart.push({ product: req.params.id, quantity: 1 });
  req.session.cart = cart;
  res.redirect('/cart');
});

router.get('/', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  const cart = await Promise.all((req.session.cart || []).map(async item => {
    const product = await Product.findById(item.product);
    return { ...item, product };
  }));
  res.render('cart', { cart });
});

router.post('/remove/:id', ensureAuthenticated, ensureRole('customer'), (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart = req.session.cart.filter(item => item.product != req.params.id);
  res.redirect('/cart');
});

router.get('/checkout', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) return res.redirect('/cart');
  const cart = await Promise.all(req.session.cart.map(async item => {
    const product = await Product.findById(item.product);
    return { ...item, product };
  }));
  res.render('checkout', { cart });
});

const Order = require('../models/order');
router.post('/checkout', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) return res.redirect('/cart');
  // Decrement product quantity
  for (const item of req.session.cart) {
    const product = await Product.findById(item.product);
    if (product.quantity < item.quantity) return res.redirect('/cart');
    await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
  }
  const order = await Order.create({
    user: req.session.userId,
    products: req.session.cart,
    status: 'Paid'
  });
  req.session.cart = [];
  res.redirect(`/orders/${order._id}`);
});

module.exports = router;