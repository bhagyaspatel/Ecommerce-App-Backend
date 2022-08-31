const cookieToken = (user, res) => {
	const token = user.getJwtToken();

	const options = {
		expires: new Date(Date.now() + process.env.COOKIE_TIME * 1000 * 60 * 60 * 24),
		httpOnly: true
	};

	//cookie is only available for web not for mobile
	user.password = undefined;

	res.status(200).cookie('cookieToken', token, options).json({
		success: true,
		token,
		user
	});
};


module.exports = cookieToken;