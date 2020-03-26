const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require ('passport');
const config = require('./config/database');
const cookieParser = require('cookie-parser');


mongoose.connect(config.database,{ useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

//Establishing connection with DATABASE
db.once('open',function(){
  console.log("Connected to MongoDb");
});

//Checking for errors
db.on('error',function(){
  console.log(error.message);
});

const app = express();

//Bring in Models
let Query = require('./models/query');
let User = require('./models/user');
let Product = require('./models/product');


app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false}));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname,'public')));


app.use(session({
  secret: 'web tech',
  resave: true,
  saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req, res, next){
  res.locals.user = req.user || null;
  next();
});


//Home Route
app.get('/', (req,res) => {
  var user=null;
  if(req.user)
  {
    user=req.user;
  }
  Product.find({brand:"Adidas"}).exec(function(err,adidas_products){
  Product.find({brand:"Nike"}).exec(function(err,nike_products){
  Product.find({brand:"Puma"}).exec(function(err,puma_products){
  Product.find({price:{$gt:9000}}).exec(function(err,exclusive_products){
    res.render('home',{
      exclusive_products: exclusive_products,
      adidas_products: adidas_products,
      nike_products: nike_products,
      puma_products: puma_products,
      user: user
    });
  });
  });
  });
  });
});

app.get('/contact',ensureAuthenticated,(req,res) => {
  User.findById(req.user.id).exec(function(err,user){
    res.render('contact',{
      user: user
    });
  });
});

app.post('/contact',[
  check('name').not().isEmpty(),
  check('email').not().isEmpty(),
  check('email').isEmail(),
  check('subject').not().isEmpty(),
  check('message').not().isEmpty()
  ],function(req,res){

    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const errors = validationResult(req);
      if(!errors.isEmpty())
      {
          req.flash('danger','Please enter valid details.');
          res.redirect('/contact');
      }
      else
      {
          let newQuery = new Query({
            name: name,
            email: email,
            subject: subject,
            message: message,
          });

          newQuery.save(function(err){
            if(err)
            {
              console.log(err.message);
              return;
            }
            else
            {
              req.flash('success','Message Received');
              res.redirect('/contact');
            }
          });
      }
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

//Route Files
let admin = require('./routes/admin');
let product = require('./routes/product');
let users = require ('./routes/users');
app.use('/users',users);
app.use('/admin',admin);
app.use('/product',product);

//Start server
app.listen(5000,function(){
  console.log('Server started on port 5000.');
});
