const BigPromise = require('../middleware/bigPromise');
const User = require('../models/user');
const customError = require('../uitls/customErrors');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
	const token = req.cookies.cookieToken || req.header("Authorization").replace("Beared ", "") || req.body;

	console.log("token " + token);

	if (!token) {
		return next(new customError('Login first to access the profile page'), 401);
	}

	//in token we have stored user._id (check the method of jwtToken in model)
	const decode = jwt.verify(token, process.env.JWT_SECRET);

	console.log("decode " + decode);
	console.log("decode.id " + decode.id);

	//injecting our own property to the "req" called as "user"
	req.user = await User.findById(decode.id);

	console.log("req.user " + req.user);
	console.log("req.user._id " + req.user._id);
	console.log("req.user.id " + req.user.id);
	//both req.user._id and req.user.id is same

	next();
});

exports.customRole = (...role) => { //this method accepts the array , although we will be passing only one role "admin"/"manager" but taking it as an array allows us to use the JS array funcationalities

	return (req, res, next) => {
		//simply checking if user.role === 'admin' or not
		if (!role.includes(req.user.role)) {
			return next(new customError('You are not allowed for this resource', 401));
		}
		next();

		// if (req.user.role === 'admin'){...}
	};
};