const express = require('express');
const path = require('path');
var fs = require('fs');
var os = require('os');
const router =express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const orderid = require('order-id')('my secret');
const cookieParser = require('cookie-parser');
const jwt  = require('jsonwebtoken');
const https = require('https');

//Bring in Models
let User = require('../models/user');
let Order = require('../models/order');
let Product = require('../models/product');
//Registration form
router.get('/register',function(req,res){
  res.render('register');
})

//Login form
router.get('/login',function(req,res){
  res.render('login');
});

//Creating a New User
router.post('/register',[
  check('firstname').not().isEmpty(),
  check('lastname').not().isEmpty(),
  check('dob').not().isEmpty(),
  check('gender').not().isEmpty(),
  check('number').not().isEmpty(),
  check('email').not().isEmpty(),
  check('email').isEmail(),
  check('username').not().isEmpty(),
  check('password').not().isEmpty(),
  check('re_password').not().isEmpty(),
  check('house_num').not().isEmpty(),
  check('add_1').not().isEmpty(),
  check('add_2').not().isEmpty(),
  check('city').not().isEmpty(),
  check('state').not().isEmpty(),
  check('pincode').not().isEmpty(),
  ],function(req,res){


    if(req.body.password !== req.body.re_password)
    {
      req.flash('danger',"Passwords don't match.");
      res.redirect('/users/register');
      return;
    }

    const name = req.body.firstname +" "+ req.body.lastname;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const number = req.body.number;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const address = req.body.house_num +', '+ req.body.add_1 + '\n' + req.body.add_2;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const country = req.body.country;


    const errors = validationResult(req);
      if(!errors.isEmpty())
      {

          req.flash('danger','Oops!! Something went wrong.');
          req.flash('danger','Please enter valid details.');
          res.redirect('/users/register');
      }
      else
      {
          let newUser = new User({
            name: name,
            dob: dob,
            gender: gender,
            number: number,
            email: email,
            username: username,
            password: password,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            country: country
          });

          bcrypt.genSalt(10, function(err, salt){
              bcrypt.hash(newUser.password, salt, function(err, hash){
                if(err){
                  console.log(err.message);
                }
                newUser.password = hash;
                newUser.save(function(err){
                  if(err){
                    console.log(err.message);
                    return;
                  } else {
                      req.flash('success','You are now registered.');
                      res.redirect('/users/login');
                  }
                });
              });
          });
      }
});


router.get('/cart', verifyToken,ensureAuthenticated, function(req, res){
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      console.log(err.message);
      req.flash('danger','Please login');
      res.redirect('/users/login');
    } else {
      User.findById(req.user.id).populate('cart.product_id').exec(function(err,user){
        res.render('cart',{
          user: user
        });
      });
    }
  });
});

router.get('/checkout',ensureAuthenticated,function(req, res){
  User.findById(req.user.id).populate('cart.product_id').exec(function(err,user){
    res.render('checkout',{
      user: user
    });
  });
});

router.post('/checkout',function(req, res){
  User.findById(req.user.id).populate('cart.product_id').exec(function(err,user){
    const order_number = orderid.generate();
    var products = [];
    const date = new Date();
    var amount = 0;
    const billing_address = req.body.address1 +'/'+ req.body.city1 + '/' + req.body.state1 + '/' + req.body.country1;
    const shipping_address = req.body.address2 +'/'+ req.body.city2 + '/' + req.body.state2 + '/' + req.body.country2;
    for(var i=0;i<user.cart.length;i++)
    {
      amount += user.cart[i].product_id.price*user.cart[i].quantity;
      var object = {
        product_id:user.cart[i].product_id.id,
        quantity:user.cart[i].quantity
      }
      products.push(object);
    }

    //console.log(amount);
    let newOrder = new Order({
      user_id: user.id,
      order_number: order_number,
      products: products,
      date: date,
      amount: amount,
      billing_address: billing_address,
      shipping_address: shipping_address,
    });

    newOrder.save(function(err){
        if(err)
        {
          console.log(err.message);
          return;
        }
        else
        {
          user.cart =[];
          const object = {
              order_id: newOrder.id
          }
          user.orders.push(object);
          user.save(function(err){
              if(err)
              {
                console.log(err.message);
                return;
              }
              else
              {
                req.flash("success","Thank you. Your order has been received.");
                res.redirect('/users/order_details/'+newOrder.order_number);
              }
          });
        }
    });
  });
});

router.get('/order_details/:id',ensureAuthenticated,function(req, res){
  User.findById(req.user.id).exec(function(err,user){
  Order.findOne({order_number:req.params.id}).populate('products.product_id').exec(function(err,order){
    var bill=order.billing_address.split('/');
    var ship=order.shipping_address.split('/');
    res.render('order_details',{
        user: user,
        order: order,
        bill: bill,
        ship: ship
      });
  });
  });
});

router.get('/wishlist',ensureAuthenticated,function(req, res){
  User.findById(req.user.id).populate('wishlist.product_id').exec(function(err,user){
    res.render('wishlist',{
      user: user
    });
  });
});

router.delete('/wishlist',function(req, res){
  User.findById(req.user.id).exec(function(err,user){

    const index = user.wishlist.findIndex( ({_id}) => _id   == req.body.product_id);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    }

    user.save(function(err){
        if(err)
        {
          console.log(err.message);
          return;
        }
        else
        {
          res.send(""+user.wishlist.length);
        }
    });

  });
});

router.get('/orders',ensureAuthenticated,function(req, res){
  User.findById(req.user.id).populate('orders.order_id').exec(function(err,user){
    res.render('order',{
      user: user
    });
  });
});

router.get('/orders/:id',ensureAuthenticated,function(req, res){
  User.findById(req.params.id).populate('orders.order_id').exec(function(err,main_user){
  User.findById(req.user.id).exec(function(err,user){
      res.render('order',{
      user: user,
      main_user: main_user
    });
  });
  });
});

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: true}),function(req, res,){
    var user = req.user;
    jwt.sign({user},"secretkey",(err,token) => {
      res.cookie('user',token);
      key=token;
      res.redirect('/');
    });
});

router.get('/logout',function(req, res){
  res.clearCookie('user');
  token="";
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

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.cookies;
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.user;

    req.token = bearer;
    // Next middleware
    next();
  } else {
    // Forbidden
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }

}


module.exports = router;
