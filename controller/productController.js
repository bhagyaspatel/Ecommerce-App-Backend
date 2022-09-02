const BigPromise = require('../middleware/bigPromise');
const Product = require('../models/product');
const CustomError = require('../uitls/customErrors');
const cloudinary = require("cloudinary").v2;

exports.testPoduct = BigPromise(async (req, res, next) => {
	console.log(req.query); //notice the output : comes as an object : for way giving input see chap:11, vid:3 bookmark
	res.send('test');
});

exports.addProduct = BigPromise(async (req, res, next) => {
	//images
	if (!req.files) {
		return next(new (CustomError('Images are required', 401)));
	}

	let imageArray = [];

	if (req.files) {
		for (let index = 0; index < req.files.photos.length; index++) {
			let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
				folder: "products"
			});

			imageArray.push({
				id: result.public_id,
				secure_url: result.secure_url
			});
		}
	}

	req.body.photos = imageArray;
	req.body.user = req.user.id;
	//now all the required field are in req.body (name,brand...will be sent to req.body only from frontend)

	const product = await Product.create(req.body);

	res.status(200).json({
		success: true,
		product
	});
});


