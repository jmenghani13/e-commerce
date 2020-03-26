const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    default:"Crafted with imported Canvas this Pair of 2 shoes are durable and lightweight that will make you go through the daily jostle in an easy way. The design of this shoes is fashionable and can be worn for every use. Chevit presents a new age Casual Loafers, Running shoes, Sneakers Shoes, Outdoor Shoes, Mocassins best suited for casual and outdoor lifestyle wear for Mens."
  },
  specification:{
      heel_height:{type:String,default:"Mid-Top"},
      material:{type:String},
      padding:{type:String},
      closure:{type:String}
  },
  price:{
    type: Number,
    required:true
  },
  brand:{
    type:String,
    required: true
  },
  category:{
    type:String,
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  picture:[{
      type: String
  }],
  comments:[{
    comment_name:{ type: String},
    comment_text:{ type: String},
    comment_email:{ type: String},
    comment_date: { type: Date}
  }],
  reviews:[{
    review_name:{ type: String},
    review_email:{ type: String},
    review_date: { type: Date},
    review_rating: { type: Number},
    review_text:{ type: String}
  }]
});


const Product = module.exports = mongoose.model('Product',ProductSchema);
