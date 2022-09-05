const express = require('express');
const router = express.Router();

const { testPoduct, addProduct, getAllProducts, adminAllProducts,
	getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct,
	addReview, deleteReview, getOnlyReviewsOfOneProduct } = require('../controller/productController');

const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

//test route for query
router.route('/test').get(testPoduct);

//user routes
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getOneProduct);
router.route('/review').put(isLoggedIn, addReview)
	.delete(isLoggedIn, deleteReview);
router.route('/reviews').get(getOnlyReviewsOfOneProduct);

//admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').post(isLoggedIn, customRole('admin'), adminAllProducts);
router.route('/admin/update/product/:id').put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
	.delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);


module.exports = router;