const express = require('express');
const path = require('path');
var fs = require('fs');
var os = require('os');
const router =express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const crypto = require('crypto');

let User = require('../models/user');
let Product = require('../models/product');

router.get('/add_product',ensureAuthenticated,function(req,res){
  res.render('add_product');
});


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/photos/')
  },
  filename: (req, file, cb) => {
    let customFileName = crypto.randomBytes(18).toString('hex');
    // get file extension from original file name
    let fileExtension = path.extname(file.originalname).split('.')[1];
    console.log(customFileName);
    console.log(fileExtension);
    cb(null, customFileName + '.' + fileExtension)
  }
});

var upload = multer({ storage: storage })

//Adding a New Product
router.post('/add_product',upload.single('filefeild'),
  [
  check('name').not().isEmpty(),
  check('price').not().isEmpty(),
  check('brand').not().isEmpty(),
  check('category').not().isEmpty(),
  check('stock').not().isEmpty(),
  check('description').not().isEmpty(),
  check('material').not().isEmpty(),
  check('closure').not().isEmpty(),
  check('heel_height').not().isEmpty(),
  check('padding').not().isEmpty()
  ],
  function(req,res,next){

    const name = req.body.name;
    const price = req.body.price;
    const brand = req.body.brand;
    const category = req.body.category;
    const description = req.body.description;
    const stock = req.body.stock;
    const material = req.body.material;
    const padding = req.body.padding;
    const closure = req.body.closure;
    const heel_height = req.body.heel_height;

    const errors = validationResult(req);

      if(!errors.isEmpty())
      {
          req.flash('danger','Please enter valid details.');
          res.redirect('/product/add_product');
      }
      else
      {
          let newProduct = new Product({
            name: name,
            price:price,
            brand: brand,
            category: category,
            stock: stock,
            description:description,
            specification:{
              heel_height:heel_height,
              material:material,
              padding:padding,
              closure:closure
            }
          });

            newProduct.picture.push(req.file.filename);

            newProduct.save(function(err){
              if(err){
                console.log(err.message);
                return;
              } else {
                  req.flash('success','Product Added');
                  res.redirect('/product/add_product');
              }
            });
      }
});



router.get('/all_products',function(req,res){
  var adidas=0;
  var bata=0;
  var nike=0;
  var puma=0;
  var woodland=0;

  var sports=0;
  var casual=0;
  var formal=0;
  var sneakers=0;
  var customer=null;

  if(req.user)
  {
    User.findById(req.user.id).exec(function(err,user){
      customer=user;
    });
  }

  Product.find({}).exec(function(err,products){
    for(var i=0;i<products.length;i++)
    {
      if(products[i].brand=="Adidas")
        adidas++;
      else if(products[i].brand=="Bata")
        bata++;
      else if(products[i].brand=="Nike")
        nike++;
      else if(products[i].brand=="Puma")
        puma++;
      else if(products[i].brand=="Woodland")
        woodland++;

      if(products[i].category=="Sports")
        sports++;
      else if(products[i].category=="Casual")
        casual++;
      else if(products[i].category=="Sneakers")
        sneakers++;
      else if(products[i].category=="Formal")
        formal++;
    }
    res.render('all_products',{
      products: products,
      adidas: adidas,
      puma: puma,
      nike: nike,
      woodland: woodland,
      bata: bata,
      sports: sports,
      casual: casual,
      formal: formal,
      sneakers: sneakers,
      user: customer
    });
  });
});




router.put('/all_products',function(req,res){
  User.findById(req.user.id).exec(function(err,user){

    if(req.body.product_id_w == undefined)
    {
        const object = {
        product_id: req.body.product_id_c
        }

        User.findById(req.user.id).select({ cart: {$elemMatch: {product_id: req.body.product_id_c}}}).exec(function(err,new_user){
          if(new_user.cart.length!=0)
          {
            new_user.cart[0].quantity++;

            new_user.save(function(err){
                if(err){
                  console.log(err.message);
                  return;
                }
                else {
                  res.sendStatus(200);
                }
            });
          }
          else {
            user.cart.push(object);

            user.save(function(err){
                if(err){
                  console.log(err.message);
                  return;
                }
                else {
                  res.sendStatus(200);
                }
            });
          }
        });
    }
    else
    {
      const object = {
          product_id: req.body.product_id_w
      }
      user.wishlist.push(object);

      user.save(function(err){
            if(err){
              console.log(err.message);
              return;
            }
            else {
              res.sendStatus(200);
            }
      });
    }
    });
});



router.get('/product_details/:id',function(req,res){
  Product.findById(req.params.id).exec(function(err,product){
    Product.find({category:product.category}).exec(function(err,c_products){
      Product.find({brand:product.brand}).exec(function(err,b_products){
        res.render('product_details',{
          product: product,
          c_products: c_products,
          b_products: b_products
        });
      });
    });
  });
});




router.put('/product_details/:id',function(req,res){
  Product.findById(req.params.id,function(err,product){

      if(typeof req.body.comment_name !== "undefined" && typeof req.body.comment_email !== "undefined" && typeof req.body.comment_text !== "undefined")
      {
        const object = {
            comment_name: req.body.comment_name,
            comment_email: req.body.comment_email,
            comment_text: req.body.comment_text,
            comment_date: req.body.comment_date
          }
        product.comments.push(object);

        product.save(function(err){
            if(err)
            {
              console.log(err.message);
              return;
            }
            else
            {

              var data=object.comment_date;
              res.send(data);
            }
        });
      }
      else if(req.body.review_rating !== "0" && typeof req.body.review_name!=="undefined" && typeof req.body.review_email!=="undefined" && typeof req.body.review_text!=="undefined")
      {
          const object = {
              review_rating: req.body.review_rating,
              review_name: req.body.review_name,
              review_email: req.body.review_email,
              review_text: req.body.review_text,
              review_date: req.body.review_date
            }
          product.reviews.push(object);
          product.save(function(err){
              if(err)
              {
                console.log(err.message);
                return;
              }
              else
              {
                var data=object.review_date;
                res.send(data);
              }
          });
      }
      else
      {
        req.flash('danger','Please enter a valid comment/review.');
        res.sendStatus(406);
      }
    });
});



router.get('/category/:id',function(req,res){
  var adidas=0;
  var bata=0;
  var nike=0;
  var puma=0;
  var woodland=0;


  var sports=0;
  var casual=0;
  var formal=0;
  var sneakers=0;
  var customer=null;


  Product.find({category : req.params.id}).exec(function(err,products){

    for(var i=0;i<products.length;i++)
    {
      if(products[i].brand=="Adidas")
        adidas++;
      else if(products[i].brand=="Bata")
        bata++;
      else if(products[i].brand=="Nike")
        nike++;
      else if(products[i].brand=="Puma")
        puma++;
      else if(products[i].brand=="Woodland")
        woodland++;

        if(products[i].category=="Sports")
          sports++;
        else if(products[i].category=="Casual")
          casual++;
        else if(products[i].category=="Sneakers")
          sneakers++;
        else if(products[i].category=="Formal")
          formal++;
    }

    res.render('category',{
      products: products,
      category: req.params.id,
      adidas: adidas,
      puma: puma,
      nike: nike,
      woodland: woodland,
      bata: bata,
      bata: bata,
      sports: sports,
      casual: casual,
      formal: formal,
      sneakers: sneakers,

    });
  });
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
