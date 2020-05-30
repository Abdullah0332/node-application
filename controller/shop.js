const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const stripe = require('stripe')(process.env.MONGO_STRIPE_KEY);
const fs=require('fs');
const path=require('path');
const PDFDocument=require('pdfkit')
const ITEM_PER_PAGE=2;

exports.getindex = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalitem;
  Product.find()
  .count()
  .then(numProducts=>{
    totalitem= numProducts;
    return Product.find()
  .skip((page-1) * ITEM_PER_PAGE)
  .limit(ITEM_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/index', {
      prods: products ,
      pagetitle: 'Shop',
      path: '/',
      isAuthenticated: req.session.isLoggedIn,
      currentpage: page,
      hasNextPage: ITEM_PER_PAGE * page < totalitem,
      hasPreviouspage : page > 1,
      nextpage : page + 1,
      privouspage: page - 1,
      lastpage:  Math.ceil(totalitem/ITEM_PER_PAGE)
    });
  })
  .catch(err=> 
    { const error = new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
}

exports.getproduct = (req,res,next)=>{
const prodId=req.params.productId;
Product.findById(prodId)
.then(product=>{
  res.render('shop/product-detail',{
    product: product,
    pagetitle: product.title,
    path: '/products',
    isAuthenticated: req.session.isLoggedIn
  })
  })
.catch(err=>
  { const error = new Error(err);
    error.httpStatusCode=500;
    return next(error);
  });
};

exports.getproductlist = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalitem;
  Product.find()
  .count()
  .then(numProducts=>{
    totalitem= numProducts;
    return Product.find()
  .skip((page-1) * ITEM_PER_PAGE)
  .limit(ITEM_PER_PAGE)
  })
  .then(products=>{
    res.render('shop/product-list', {
      prods: products ,
      pagetitle: 'All Products',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
      currentpage: page,
      hasNextPage: ITEM_PER_PAGE * page < totalitem,
      hasPreviouspage : page > 1,
      nextpage : page + 1,
      privouspage: page - 1,
      lastpage:  Math.ceil(totalitem/ITEM_PER_PAGE)
    });
  })
  .catch(err=> 
    { const error = new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
  };


exports.getcart = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
    .then(user=>{
      const products=user.cart.items;
      res.render('shop/cart', {
          pagetitle: 'Cart',
          path: '/cart',
          products: products,
          isAuthenticated: req.session.isLoggedIn
      })
}).catch(err=> 
  { const error = new Error(err);
    error.httpStatusCode=500;
    return next(error);
  }); 
};

exports.postcart=(req,res,next)=>{
  const prodId=req.body.productid;
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
  }).then(result=>{
    console.log(result);
    res.redirect('/cart');
  })
}

exports.getoder = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
  .then(orders=>{
    res.render('shop/orders', {
      pagetitle: 'Order',
      path: '/order',
      orders : orders,
      isAuthenticated: req.session.isLoggedIn
    })
  })
};

exports.postcartdeleteitem=(req,res,next)=>{
  prodId=req.body.productId;
  req.user
  .deleteitemfromcart(prodId)
  .then(product=>{
    Cart.deleteproduct(prodId);
    res.redirect('/cart');
  })
  .catch(err=> 
    { const error = new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
  }

exports.postorder=(req,res,next)=>{

  const token=req.body.stripeToken;
  console.log(token)
  let totalSum = 0;
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user=>{
    user.cart.items.forEach(p => {
      totalSum += p.quantity * p.productId.price;
    });
    const products=user.cart.items.map(i=>{
      return { quantity: i.quantity, product:{...i.productId._doc}}
    });
    const order=new Order({
      user:{ 
        email : req.user.email,
        userId: req.user._id
      },
      products:products
    });
    return order.save(); 
  })
  .then(result=>{
    const charge = stripe.charges.create({
      amount: totalSum * 100,
      currency: 'usd',
      description: 'First',
      source: token
    });
    return req.user.clearCart();
    })
  .then(()=>{
      res.redirect('/order');
    })
    .catch(err=>
      { console.log(err)
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
      })
}

exports.getinvoice=(req,res,next)=>{
const orderId=req.params.orderId;
Order.findById(orderId)
.then(order=>{
  if(!order){
    return next(new Error('No Order Found'));
  }
  if(order.user.userId.toString() !== req.user._id.toString()){
    return next(new Error('unortharized'));
  }
const invoiceName='invoice-'+orderId+'.pdf';
const invoicePath=path.join('data','invoices',invoiceName);

const pdfDoc= new PDFDocument();
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');

pdfDoc.pipe(fs.createWriteStream(invoicePath));
pdfDoc.pipe(res);

pdfDoc.fontSize(26).text('Invoice',{
  underline:true
});
pdfDoc.text('-------------');
pdfDoc.fontSize(14).text("Email : "+order.user.email)
pdfDoc.fontSize(14).text("UserId : "+order.user.userId)
pdfDoc.text("------------------")
let totalprice=0;
order.products.forEach(prod=>{
  totalprice += prod.quantity * prod.product.price;
  pdfDoc.fontSize(14).text('Product Title : '+prod.product.title);
  pdfDoc.fontSize(14).text('Product Quantity : '+prod.quantity);
  pdfDoc.fontSize(14).text('Product Price : '+prod.product.price);
    pdfDoc.text('-------------');
  pdfDoc.fontSize(20).text('Total Price = '+totalprice);
})
pdfDoc.end();
})
.catch(err=>{
  { const error = new Error(err);
    error.httpStatusCode=500;
    return next(error);
  }
})

};

exports.getcheckout=(req,res,next)=>{
  req.user
  .populate('cart.items.productId')
  .execPopulate()
    .then(user=>{
      const products=user.cart.items;
      let total=0;
      products.forEach(product=>{
        total += product.quantity * product.productId.price;
      })
      res.render('shop/checkout', {
          pagetitle: 'Checkout',
          path: '/checkout',
          products: products,
          isAuthenticated: req.session.isLoggedIn,
          totalSum: total
      })
}).catch(err=> 
  { const error = new Error(err);
    error.httpStatusCode=500;
    return next(error);
  }); 
}