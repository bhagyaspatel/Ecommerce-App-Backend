const BigPromise = require('../middleware/bigPromise'); //our BigPromise is a big FUNCTION

// exports.home = (req, res) => {
// 	res.status(200).json({
// 		success: true,
// 		greeting: "Hello from API"
// 	});
// };

//after using BigPromise
exports.home = BigPromise(async (req, res) => {
	//const db = wait something() ..this is how we can use async await if we want to

	res.status(200).json({
		success: true,
		greeting: "Hello from API"
	});
});


//without BigPromise : Anything can be used
exports.homeDummy = async (req, res) => {

	try {
		//const db = wait something()
		res.status(200).json({
			message: "This is the dummy route controller"
		});
	} catch (error) {

	}
}; 