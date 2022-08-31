const BigPromise = require('../middleware/bigPromise');
const User = require('../models/user');
const customError = require('../uitls/customErrors');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
	const token = req.cookies.cookieToken || req.header("Authorization").replace("Beared ", "") || req.body;

	if (!token) {
		return next(new customError('Login first to access the profile page'), 401);
	}

	//in token we have stored user._id (check the method of jwtToken in model)
	const decode = jwt.verify(token, process.env.JWT_SECRET);

	//injecting our own property to the "req" called as "user"
	req.user = await User.findById(decode.id);

	next();
});
