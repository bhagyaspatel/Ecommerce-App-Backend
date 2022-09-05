const User = require('../models/user');
const BigPromise = require('../middleware/bigPromise');
const customError = require('../uitls/customErrors');
const cookieToken = require('../uitls/cookie-token');
const fileUpload = require('express-fileupload');
const mailer = require('../uitls/emailHelper');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

exports.signup = BigPromise(async (req, res, next) => {

	const { name, email, password } = req.body;

	if (!email || !name || !password) {
		return next(new customError('Name, email and password required', 400));
	}

	if (!req.files) {
		return next(new customError('Photo is required during the sigup', 400));
	}

	let result;

	let file = req.files.photo; //frontend dev needs to know that he needs to call this a "photo"
	result = await cloudinary.uploader.upload(file.tempFilePath, {
		folder: "Ecomm",
		width: 150,
		crop: "scale"
	});

	const user = await User.create({
		name,
		email,
		password,
		photo: {
			id: result.public_id, //this is the unique id cloudinary gives to each photo
			secure_url: result.secure_url //this is the https url of the photo we uploaded
		}
	});

	cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
	const { email, password } = req.body;

	//if user did not provided email and password
	if (!email && !password) {
		return next(new customError('Please provide email and password', 400));
	}

	//since we have choosen password : selected : false in the user modal, it will not come with "user" object so we have specify that we want password
	const user = await User.findOne({ email }).select("+password");

	//if user not found in db
	if (!user) {
		return next(new customError('Please first register', 401));
	}

	//CAUTION : not User.isValidatePassword its "user" 
	const isPasswordCorrect = await user.isValidatedPassword(password);

	//if password does not match
	if (!isPasswordCorrect) {
		return next(new customError('Either the email or password does not match', 401));
	}

	//if all goes good we send the token
	cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
	res.cookie('cookieToken', null, {
		expires: new Date(Date.now()),
		httpOnly: true
	});
	res.status(200).json({
		success: true,
		message: 'Logout successfully'
	});
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
	const { email } = req.body;

	if (!email && !password) {
		return next(new customError('Please provide email', 400));
	}

	const user = await User.findOne({ email });

	if (!user) {
		return next(new customError('No such user exist, Please check your email', 401));
	}

	// console.log(user);
	const forgotToken = user.getForgotPasswordToken();

	await user.save({ validateBeforeSave: false });

	const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

	const message = `Go to this url to verify yourself ${myUrl}`;

	try {
		const option = {
			email: user.email,
			subject: 'Bhagya Ecomm - Password reset email',
			message
		};
		await mailer(option);

		res.status(200).json({
			success: true,
			message: 'Reset password email sent successfully'
		});
	} catch (error) { //IMPP
		user.forgotPasswordExpiry = undefined;
		user.forgotPasswordToken = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new customError(error.message), 500);
	}

});

exports.passwordReset = BigPromise(async (req, res, next) => {
	const token = req.params.token;

	const encryptedToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');

	//to find user from db based on encrypted token & forgotPasswordExpiry with expiry in future 
	const user = await User.findOne({
		encryptedToken,
		forgotPasswordExpiry: { $gt: Date.now() }
	});

	if (!user) {
		return next(new customError('Token is invalid or expired', 400));
	}

	if (req.body.password !== req.body.confirmPassword) {
		return next(new customError('Password and confirm password do not match', 400));
	}

	user.password = req.body.password;

	user.forgotPasswordToken = undefined;
	user.forgotPasswordExpiry = undefined;

	await user.save({ validateBeforeSave: false });

	//send a json respond or send a token
	cookieToken(user, res);

});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
	//to access the req.user we need to inject the middleware isLoggedIn (in user routes) where we have initialized this req.user property 
	const user = await User.findById(req.user.id);
	console.log(req.user);
	console.log(req.user.id);
	res.status(200).json({
		success: true,
		user
	});
});

exports.changePassword = BigPromise(async (req, res, next) => {
	const userId = req.user.id;

	const user = await User.findById(userId).select("+password");

	const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword);

	if (!isCorrectOldPassword) {
		return next(new customError('Old password is incorrect'), 400);
	}

	user.password = req.body.newPassword;

	await user.save();

	cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {

	//data to update
	const newData = {
		name: req.body.name,
		email: req.body.email,
	};

	if (newData.name === '' || newData.email === '') {
		return next(new customError('Please provide name and email', 400));
	}

	//checking if we have got a photo also to update
	if (req.files && req.files.photo !== '') {
		const user = await User.findById(req.user.id);
		const imageId = user.photo.id;

		//delete old photo on cloudinary
		const resp = await cloudinary.uploader.destroy(imageId);

		//uploading new photo on cloudinary
		const file = req.file.photo;
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			folder: "Ecomm",
			width: 150,
			crop: "scale"
		});

		newData.photo = {
			id: result.public_id,
			secure_url: result.secure_url
		};
	}

	const options = {
		new: true,
		runValidators: true,
	};
	const user = await User.findByIdAndUpdate(req.user.id, newData, options);

	res.status(200).json({
		success: true,
		user
	});

});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
	const users = await User.find(); //users is an array this time

	res.status(200).json({
		success: true,
		users
	});
});

exports.managerAllUsers = BigPromise(async (req, res, next) => {
	const users = await User.find({ role: 'user' }); //users is an array this time

	res.status(200).json({
		success: true,
		users
	});
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new customError('No user found', 400));
	}

	res.status(200).json({
		success: true,
		user
	});
});

exports.adminUpdateOneUserDetail = BigPromise(async (req, res, next) => {

	//data to update
	const newData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role
	};

	if (newData.name === '' && newData.email === '' && newData.role === '') {
		return next(new customError('Please provide some data to update', 400));
	}

	const options = {
		new: true,
		runValidators: true,
	};

	const user = await User.findByIdAndUpdate(req.params.id, newData, options);

	res.status(200).json({
		success: true,
		user
	});

});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new customError('No user found', 401));
	}

	const cloudinaryId = user.photo.id;

	// const result = await User.deleteOne({ id: req.params.id });
	await user.remove();

	await cloudinary.uploader.destroy(cloudinaryId);

	res.status(200).json({
		success: true
	});
});