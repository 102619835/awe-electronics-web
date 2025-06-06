const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');
const Order = require('../models/Order');

// Show all orders (host)
router.get('/host/all', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  const orders = await Order.find().populate('user').populate('products.product').lean();
  res.render('order_status', { orders, role: 'host' });
});

// Show my orders (customer)
router.get('/', ensureAuthenticated, ensureRole('customer'), async (req, res) => {
  const orders = await Order.find({ user: req.session.userId }).populate('products.product').lean();
  res.render('order_status', { orders, role: 'customer' });
});

// Show order detail
router.get('/:id', ensureAuthenticated, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('products.product')
    .lean();
  if (!order) return res.status(404).send('Order not found');
  if (req.session.role !== 'host' && order.user.toString() !== req.session.userId) {
    return res.status(403).send('Forbidden');
  }
  res.render('order_single', { order, role: req.session.role });
});

// Host updates order status
router.post('/:id/status', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Order.findByIdAndUpdate(id, { status });
  res.redirect(`/orders/${id}`);
});

module.exports = router;