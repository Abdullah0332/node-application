const Product = require('../models/product');
const mongoose=require('mongoose')
const { validationResult }=require('express-validator/check')
const filehelper=require('../util/file')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
      pagetitle: 'Add Product',
      path: '/admin/add-product',
      editing:false,
      hasError: false,
      isAuthenticated: req.session.isLoggedIn,
      product:{
        title: '',
        imageUrl: '',
        price: '',
        description:''
      },
      errmessage: null,
      validationerror : []
    });
};
  
exports.postAddProduct = (req, res, next) => {
const title=req.body.title;
const image=req.file;
const price=req.body.price;
const description =req.body.description;
// console.log(imgurl)
const error=validationResult(req)
if(!image){
  return res.status(422).render('admin/edit-product', {
    pagetitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: true,
    errmessage: 'Attached file is not an Image',
    product:{
      title: title,
      price: price,
      description: description
    },
    validationerror : []
  })
}
if(!error.isEmpty()){
  return res.status(422).render('admin/edit-product', {
    pagetitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: true,
    errmessage: error.array()[0].msg,
    product:{
      title: title,
      price: price,
      description: description
    },
    validationerror : error.array()
  })
}
const imgurl=image.path;

const product = new Product({
  // _id: mongoose.Types.ObjectId('5ea98b1d7148aa1d243db9b9'),
  title:title,
  price:price,
  imgUrl:imgurl,
  description:description,
  userId: req.user
});
product
    .save()
    .then(result=>{
      console.log('Created Product');
      res.redirect('/');
    })
    .catch(err => 
    { const error = new Error(err);
      error.httpStatusCode=500;
      return next(error);
    }
    );
};

exports.geteditProduct = (req, res, next) => {
const editmode=req.query.edit;
  if(!editmode){
      return res.redirect('/');
    }
  const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if (!product) {
          return res.redirect('/');
        }
    res.render('admin/edit-product', {
      pagetitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editmode,
      product: product,
      isAuthenticated: req.session.isLoggedIn,
      errmessage: null,
      validationerror : [],
      hasError: false
    });
  })
  .catch(err=>console.log(err));
};

exports.posteditproduct=( req,res,next )=>{
  const prodId=req.body.productId;
  const updatedTitle=req.body.title;
  const updatedprice=req.body.price;
  const image=req.file;
  const updateddescription=req.body.description;

  const error=validationResult(req)
if(!error.isEmpty()){
  return res.status(422).render('admin/edit-product', {
    pagetitle: 'Add Product',
    path: '/admin/add-product',
    editing: true,
    hasError: true,
    errmessage: error.array()[0].msg,
    product:{
      title: updatedTitle,
      price: updatedprice,
      description: updateddescription
    },
    validationerror : error.array()
  })
}

  Product.findById(prodId)
.then(product=>{
  if(product.userId.toString() !== req.user._id.toString()){
    return res.redirect('/');
  }
  product.title=updatedTitle;
  if(image){
    filehelper.deletefile(product.imgUrl)
    product.imgUrl= image.path;
  }
  product.price=updatedprice;
  product.description=updateddescription;
  return product.save();
})
  .then(result=>{
    console.log('UPDATED PRODUCT');
    res.redirect('/admin/products');
  })
  .catch(err=>
    { const error = new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
  
};
  
exports.deleteProduct = (req,res,next)=>{
    const prodId=req.params.productId;
    Product.findById(prodId)
    .then(product=>{
      if(!product){
        return next(new Error('Product Not Found'))
      }
      filehelper.deletefile(product.imgUrl)
      return Product.deleteOne({_id:prodId, userId: req.user._id})
    })
    .then(()=>{
      console.log('PRODUCT DELETED');
      res.status(200).json({message: 'Success!'});
    })
    .catch(err=>
      res.status(500).json({message: ' Deteleting Product Failed'})  
    );
       
}

  exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pagetitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    });
  };
