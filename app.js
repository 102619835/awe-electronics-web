const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
mongoose.connect('mongodb://localhost:27017/awe-store');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));

// Auth middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// Home
app.get('/', (req, res) => res.render('index'));

// Register
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await User.create({ username: req.body.username, password: hashed });
    res.redirect('/login');
});

// Login
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/products');
    } else {
        res.send('Invalid credentials');
    }
});

// Products
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.render('products', { products });
});

// Add to cart
app.post('/cart/add', isAuthenticated, async (req, res) => {
    const product = await Product.findById(req.body.productId);
    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push(product);
    res.redirect('/products');
});

// Checkout
app.get('/checkout', isAuthenticated, async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) return res.send('Cart is empty');
    await Order.create({ user: req.session.userId, items: req.session.cart });
    req.session.cart = [];
    res.send('Order placed successfully!');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
