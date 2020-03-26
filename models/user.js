const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  dob:{
    type: Date,
    required:true
  },
  gender:{
    type: String,
    required:true
  },
  number:{
    type: String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  address:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  pincode:{
    type:String,
    required:true
  },
  country:{
    type:String,
    required:true
  },
  orders:[{
    order_id:{ type: Object , ref: 'Order' }
  }],
  cart:[{
    product_id:{ type: Object, ref: 'Product' },
    quantity:{type: Number, default:1}
  }],
  wishlist:[{
    product_id:{ type: Object, ref: 'Product' },
  }]
});


const User = module.exports = mongoose.model('User',UserSchema);
