const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  quantity: Number
});
module.exports = mongoose.model('Product', ProductSchema);