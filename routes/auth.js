const express = require('express');

const User = require('../models/user');

const { check,body } =require('express-validator/check');

const authController = require('../controller/auth');

const router = express.Router();

// // // /admin => GET

router.get('/login',authController.getLogin);

router.get('/signup',authController.getsignup);

router.get('/reset',authController.getReset);

router.get('/reset/:token',authController.getNewPassword);

// // // /admin => POST

router.post('/login',
[
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password', 'Password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
],
authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/signup', 
[
  check('email')
  .isEmail()
  .withMessage('Please enter a valid Email')
  .normalizeEmail()
  .custom((value,{req})=>{
      return User.findOne({email : value})
    .then(UserDoc=>{
        if (UserDoc){
          return Promise.reject('Email already exist, Please Enter other one');
        }
    })
  }),
  
  body('password',
  'Please Enter a password with only text and number and at least 5 Characters')
  .isLength({min:5})
  .isAlphanumeric()
  .trim(),

  body('confirmpassword')
  .custom((value,{req})=>{
      if (value !== req.body.password){
          throw new Error('Password have to match')
      }
      return true;
  })
  .trim()
]
,authController.postsignup
);

router.post('/reset',authController.postReset);

router.post('/new-password',authController.postNewPassword);

module.exports = router;