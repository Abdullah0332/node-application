const User = require('../models/user');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const { validationResult }=require('express-validator/check')
const nodemailer=require('nodemailer');
const sendgridtransport=require('nodemailer-sendgrid-transport');


const transporter=nodemailer.createTransport(sendgridtransport({
    auth:{
      api_key: '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'
    }
  }));

exports.getLogin = (req, res, next) => {
    let message=req.flash('error');
    if (message.length > 0){
        message=message[0];
    }else{
        message= null;
    }
    res.render('auth/login', {
        pagetitle: 'Login',
        path: '/login',
        isAuthenticated: false,
        errmessage : message,
        oldInput: {
            email: "",
            password:""
        },
        validationerror : []
    });
};

exports.postLogin = (req, res, next) => {
    const email= req.body.email;
    const password= req.body.password;
    const error=validationResult(req)
    if(!error.isEmpty()){
        return res.status(422).render('auth/login',{
          path: '/login',
          pagetitle: 'Login',
          errmessage: error.array()[0].msg,
          oldInput: {
              email: email,
              password:password
          },
          validationerror : error.array()
          })
    }
    User.findOne({email:email})
    .then(user => {
        if(!user){
            return res.status(422).render('auth/login',{
                path: '/login',
                pagetitle: 'Login',
                errmessage: 'Invalid Email and Password',
                oldInput: {
                    email: email,
                    password:password
                },
                validationerror : []
                })
        }
    bcrypt.compare(password, user.password)
    .then(doMatch=>{
        if(doMatch){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err=>{
                res.redirect('/')
            });
        }
        return res.status(422).render('auth/login',{
            path: '/login',
            pagetitle: 'Login',
            errmessage: 'Invalid Email and Password',
            oldInput: {
                email: email,
                password:password
            },
            validationerror : []
            })
    })
    .catch(err=>
        { const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
      })
    })
    .catch(err => 
        { const error = new Error(err);
            error.httpStatusCode=500;
            return next(error);
          });
};

exports.postLogout=(req, res, next)=>{
    req.session.destroy((err)=>{
        res.redirect('/')
    })
}

exports.getsignup=(req, res, next)=>{
    let message=req.flash('error');
    if (message.length > 0){
        message=message[0];
    }else{
        message= null;
    }
    res.render('auth/signup',{
    path: '/signup',
    pagetitle: 'Sign Up',
    isAuthenticated: false,
    errmessage: message,
    oldInput: {
        email: "",
        password:"",
        confirmpassword: ""
    },
    validationerror: []
    });
}

exports.postsignup=(req, res, next)=>{
  const email= req.body.email;
  const password= req.body.password;
  const confirmpassword= req.body.confirmpassword;
  const error=validationResult(req)
  if(!error.isEmpty()){
      return res.status(422).render('auth/signup',{
        path: '/signup',
        pagetitle: 'Sign Up',
        isAuthenticated: false,
        errmessage: error.array()[0].msg,
        oldInput: {
            email: email,
            password:password,
            confirmpassword: confirmpassword
        },
        validationerror : error.array()
        })
  }
       bcrypt.hash(password, 16)
      .then(hashpassword=>{
        const user=new User({
            email: email,
            password: hashpassword,
            cart: { items : [] }
        });   
        return user.save()
        })
        .then(result=>{
        res.redirect('/login')
        return transporter.sendMail({
            to: email,
            from: 'abdullah.khan10032@gmail.com',
            subject: "Signup Succeeded",
            html: '<h1>You Successfully SignUp</h1>'
        }).catch(err=>{ 
            { const error = new Error(err);
                error.httpStatusCode=500;
                return next(error);
              }
        });
    });
};

exports.getReset=(req,res,next)=>{
    let message=req.flash('error');
    if (message.length > 0){
        message=message[0];
    }else{
        message= null;
    }
    res.render('auth/reset', {
        pagetitle: 'Reset Password',
        path: '/reset',
        isAuthenticated: false,
        errmessage: message
    });
}

exports.postReset=(req,res,next)=>{
    crypto.randomBytes(32, (err,Buffer)=>{
        if(err){
        console.log(err);
        return res.redirect('/reset');
    }
    const token= Buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user=>{
        if(!user){
            req.flash('error','No User with this Email found')
            return res.redirect('/reset')
        }
    user.resetToken= token;
    user.resetTokenExpire= Date.now()+360000;
    return user.save();
    })
    .then(result=>{
            res.redirect('/')
            transporter.sendMail({
            to: req.body.email,
            from: 'abdullah.khan10032@gmail.com',
            subject: "Password Reset",
            html: `
            <h1>Your Request to Reset Password</h1>
            <p>Click here to Reset your password</p>
            <a href="http://localhost:8080/reset/${token}">Click here</a>
            `
        })
    })
    .catch(err=>{
        { const error = new Error(err);
            error.httpStatusCode=500;
            return next(error);
          }
    })
    });
}

exports.getNewPassword=(req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpire:{$gt : Date.now()}})
    .then(user=>{
        let message=req.flash('error');
    if (message.length > 0){
        message=message[0];
    }else{
        message= null;
    }
    res.render('auth/new-password', {
        pagetitle: 'New Password',
        path: '/new-password',
        isAuthenticated: false, 
        errmessage: message,
        userId: user._id.toString(),
        passwordToken: token
    });
    })
    .catch(err=>{
        { const error = new Error(err);
            error.httpStatusCode=500;
            return next(error);
          }
    })
}

exports.postNewPassword=(req,res,next)=>{
    const NewPassword=req.body.password;
    const userId=req.body.userId;
    const passwordToken= req.body.passwordToken;
    let resetUser;

    User.findOne({resetToken:resetToken, resetTokenExpire:{$gt : Date.now()}, _id: userId})
    .then(user=>{
        resetuser=user;
        return bcrypt.hash(NewPassword, 16);
    })
    .then(hashpassword=>{
        resetuser.password=hashpassword;
        resetuser.resetToken= undefined;
        resetuser.resetTokenExpire=undefined;
        return resetuser.save();
    })
    .then(result=>{
        res.redirect('/login');
    })
    .catch(err=>{
        { const error = new Error(err);
            error.httpStatusCode=500;
            return next(error);
          }
    })
}