const mongoose = require('mongoose');
const Product = require('./models/Product');
mongoose.connect('mongodb://localhost:27017/awe-store');

Product.insertMany([
    { name: "Laptop", price: 1200, stock: 10 },
    { name: "Smartphone", price: 800, stock: 15 },
    { name: "TV", price: 1500, stock: 5 }
]).then(() => {
    console.log("Products added");
    process.exit();
});
