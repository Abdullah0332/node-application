const path = require('path');

const express = require('express');

const auth = require('../middleware/isAuth');

const productsController = require('../controller/shop');

const router = express.Router();

// // => GET

router.get('/', productsController.getindex);

router.get('/products', productsController.getproductlist);

router.get('/products/:productId', productsController.getproduct);

router.get('/cart', auth, productsController.getcart);

router.get('/order', auth, productsController.getoder);

router.get('/checkout', auth, productsController.getcheckout);

router.get('/order/:orderId', auth,  productsController.getinvoice)

// // // => POST

router.post('/cart-delete-item', auth, productsController.postcartdeleteitem);

router.post('/cart', auth, productsController.postcart);

module.exports = router;
