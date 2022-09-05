const express = require('express');
const router = express.Router();

const { sendStripeKey, captureStripePayment, sendRazorpayKey,
	captureRazorpayPayment } = require('../controller/paymentController');

const { isLoggedIn, customRole } = require('../middleware/userMiddleware');


router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/razorpaykey').get(isLoggedIn, sendRazorpayKey);

router.route('/capturestripe').get(isLoggedIn, captureStripePayment);
router.route('/capturerazorpay').get(isLoggedIn, captureRazorpayPayment);


module.exports = router;

