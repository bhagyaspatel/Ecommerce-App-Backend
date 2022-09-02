const express = require('express');
const router = express.Router();

const { testPoduct } = require('../controller/productController');

// const { isLoggedIn, customRole } = require('../middleware/userMiddleware');

router.route('/test').get(testPoduct);


module.exports = router;