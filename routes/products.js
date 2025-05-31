const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'public/images/' });

// Browse products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('products', { products });
});

// Host: add product form
router.get('/new', ensureAuthenticated, ensureRole('host'), (req, res) => {
  res.render('product_edit', { product: {}, action: 'Add' });
});

// Host: add product
router.post('/new', ensureAuthenticated, ensureRole('host'), upload.single('image'), async (req, res) => {
  const { name, price, quantity } = req.body;
  let image = '';
  if (req.file) image = '/public/images/' + req.file.filename;
  await Product.create({ name, price, quantity, image });
  res.redirect('/products');
});

// Host: edit product form
router.get('/:id/edit', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('product_edit', { product, action: 'Edit' });
});

// Host: update product
router.post('/:id/edit', ensureAuthenticated, ensureRole('host'), upload.single('image'), async (req, res) => {
  const { name, price, quantity } = req.body;
  const update = { name, price, quantity };
  if (req.file) update.image = '/public/images/' + req.file.filename;
  await Product.findByIdAndUpdate(req.params.id, update);
  res.redirect('/products');
});

// Host: delete product
router.post('/:id/delete', ensureAuthenticated, ensureRole('host'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/products');
});

module.exports = router;