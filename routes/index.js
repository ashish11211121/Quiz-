var express = require('express');
require('dotenv').config()
var router = express.Router();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const {User}  = require('../models/user.js')
const db = process.env.MONGODB_URL
const condb = async ()=>{
  const conn =  await mongoose.connect(db).then(() => { 
    console.log("connected to mongodb ");
   }
  )
}
condb();
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/login',(req,res)=>{
  res.render('login')
})

router.post('/check',async (req,res)=>{
  const {email,Password} = req.body;
  const user = await User.findOne({email:email,password:Password})
  if(user){
      res.redirect('/landing')
  }
  else{
      res.redirect('/login?error=wrongPassword')
      }
})

router.get('/register',(req,res)=>{
  res.render('register')
})

router.get('/register',(req,res)=>{
  res.render('register')
})

router.post('/registering', async (req, res) => {
  const { Username, email, Password } = req.body;

  try {
      let user = new User({
          username: Username,
          email: email,
          password: Password
      });

      await user.save(); // Wait for the save operation to complete

      // If the save operation was successful, redirect to '/landing'
      res.redirect('/landing');
  } catch (error) {
      console.error(error);
      // Handle error appropriately, such as rendering an error page or showing a message to the user
      res.status(500).send("Registration failed. Please try again.");
  }
});

router.get("/landing",(req,res)=>{
  res.render('landing')
})
router.get("/about",(req,res)=>{
  res.render('about')
})
router.get("/contact",(req,res)=>{
  res.render('contact')
})
router.get("/thank",(req,res)=>{
  res.render('thank')
})
router.get("/gkquiz",(req,res)=>{
  res.render('gkquiz', {foo: '1'})
})
router.get("/sciencequiz",(req,res)=>{
  res.render('gkquiz', {foo: '2'})
})
router.get("/historyquiz",(req,res)=>{
  res.render('gkquiz', {foo: '3'})
})
router.get("/sportsquiz",(req,res)=>{
  res.render('gkquiz', {foo: '4'})
})



module.exports = router;
