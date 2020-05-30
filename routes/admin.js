const path = require('path');

const express = require('express');

const { check } =require('express-validator/check')
const auth = require('../middleware/isAuth');

const productsController = require('../controller/admin');

const router = express.Router();

// // /admin => GET
router.get('/add-product', auth, productsController.getAddProduct);

router.get('/products', auth, productsController.getProducts);

router.get('/edit-product/:productId', auth, productsController.geteditProduct);

// // // /admin => POST
router.post('/add-product',
[
check('title')
.isString()
.trim()
.isLength({min:3}),

check("price")
.isFloat(),
check('description')
.isString()
.trim()
.isLength({min:5 , max: 400}),
],
auth, productsController.postAddProduct);

router.post('/edit-product',
[
check('title')
.isString()
.trim()
.isLength({min:3}),

check("price")
.isFloat(),
check('description')
.isString()
.trim()
.isLength({min:5 , max: 400}),
],
    auth, productsController.posteditproduct);

router.delete('/product/:productId', auth, productsController.deleteProduct);

module.exports = router;
