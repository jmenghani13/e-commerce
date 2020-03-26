const mongoose = require('mongoose');

const QuerySchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  subject:{
    type:String,
    required:true
  },
  message:{
    type:String,
    required:true
  }
});


const Query = module.exports = mongoose.model('Query',QuerySchema);
