const express = require('express');
const path = require('path');
var fs = require('fs');
var os = require('os');
const router =express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const xml2js = require('xml2js');
var parser = new xml2js.Parser();
const orderid = require('order-id')('my secret');

let User = require('../models/user');
let Product = require('../models/product');
let Order = require('../models/order');

router.get('/login',function(req,res){
  res.render('admin_login');
});

router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/admin/login',
    failureFlash: true
  })(req, res,next);
});

router.get('/orders',function(req,res){
  Order.find({}).populate('user_id products.product_id').exec(function(err,orders){
    res.render('orders',{
      orders:orders
    });
  });
});

router.get('/users',function(req,res){
  User.find({}).exec(function(err,users){
    res.render('users',{
      users: users
    });
  });
});




router.post('/invoice',function(req,res){
  Order.findOne({order_number:req.body.order_number}).exec(function(err,order){
    var invoice_number = orderid.generate();
    var products=[];
    for(var i=0;i<order.products.length;i++)
    {
        var object={product_id:order.products[i].product_id,quantity:order.products[i].quantity};
        products.push(object);
    }

    var obj = { invoice_number: invoice_number, order_number:order.order_number, user_id:order.user_id, products: products,
      amount:order.amount, billing_address:order.billing_address, shipping_address:order.shipping_address, mode:order.mode}
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);

    fs.writeFile('/projects/e-commerce/views/invoice.xml',xml,function(err){
      if(err)
      {
        console.log(err.message);
      }
      else
      {
        res.sendStatus(200);
      }
    });
  });
});

router.get('/invoice',ensureAuthenticated,function(req,res){
  fs.readFile('/projects/e-commerce/views/invoice.xml',function(err,data){
    parser.parseString(data,function(err,result){
      Order.findOne({order_number:result.root.order_number[0]}).populate('user_id products.product_id').exec(function(err,order){
        var bill=order.billing_address.split('/');
        var ship=order.shipping_address.split('/');
        var months = ["January","Febuary","March","April","May","June","July","August","September","October","November","December"];
        var month = order.date.getMonth();
        // console.log(order);
        // console.log(order.products);
        res.render('invoice',{
          order:order,
          bill: bill,
          ship: ship,
          month: months[month]
        });
      });
    });
  });

});


router.get('/logout',function(req, res){
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/');
});

//Authentication for login
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
