const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

router.get('/', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  const orders = await Order.find({ user: req.session.userId }).populate('products.product');
  res.render('order_status', { orders, isHost: false });
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('products.product');
  if (!order) return res.redirect('/orders');
  // Only show to owner or host
  if (order.user.toString() !== req.session.userId && req.session.role !== 'host') return res.status(403).send('Forbidden');
  res.render('order_single', { order, isHost: req.session.role === 'host' });
});

router.get('/host/all', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  const orders = await Order.find().populate('products.product');
  res.render('order_status', { orders, isHost: true });
});

router.post('/:id/status', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.redirect(`/orders/${req.params.id}`);
});

module.exports = router;