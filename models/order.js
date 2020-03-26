const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
  order_number:{
    type: String,
    required:true
  },
  user_id:{
    type: Object,
    ref: 'User'
  },
  products:[{
    product_id:{ type: String, ref: 'Product' },
    quantity:{type: Number, default:1}
  }],
  date:{
    type: Date,
    required:true
  },
  amount:{
    type: Number,
    required:true
  },
  billing_address:{
    type: String,
    required:true
  },
  shipping_address:{
    type: String,
    required:true
  },
  mode:{
    type: String,
    required:true,
    default:"Cash On Delivery"
  }
});


const Order = module.exports = mongoose.model('Order',OrderSchema);
