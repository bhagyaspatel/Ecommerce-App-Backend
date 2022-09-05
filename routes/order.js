const express = require('express');
const router = express.Router();

const { createOrder, getOneOrder, getMyAllOrders,
	admingGetAllOrders, adminUpdateOrders, admingDeleteOrders } = require('../controller/orderController');

const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/:id').get(isLoggedIn, getOneOrder);
// router.route('/order/myorder').get(isLoggedIn, getMyAllOrders);
router.route('/myorders').get(isLoggedIn, getMyAllOrders);
//if we make the name of the rout '/order/myorder' it will give us an error bcz we have specified 
//'/order/:id' first so when we go to '/order' it first evaluates '/order/:id' so it takes '/myorders' as '/:id'..so just change the name OR just place route containing ':' at very end


//admin routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), admingGetAllOrders);
router.route('/admin/order/:id').put(isLoggedIn, customRole('admin'), adminUpdateOrders)
	.delete(isLoggedIn, customRole('admin'), admingDeleteOrders);


module.exports = router;