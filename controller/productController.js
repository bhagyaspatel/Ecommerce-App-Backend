const BigPromise = require('../middleware/bigPromise');
const product = require('../models/product');
const Product = require('../models/product');
const CustomError = require('../uitls/customErrors');
const WhereClause = require('../uitls/whereClause');
const cloudinary = require("cloudinary").v2;

exports.testPoduct = BigPromise(async (req, res, next) => {
	console.log(req.query); //notice the output : comes as an object : for way giving input see chap:11, vid:3 bookmark
	res.send('test');
});


exports.addProduct = BigPromise(async (req, res, next) => {
	//images
	if (!req.files) {
		return next(new CustomError('Images are required', 401));
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

exports.getAllProducts = BigPromise(async (req, res, next) => {
	const resultPerPage = 6;

	const totalProductNumber = Product.length;

	const productsObj = new WhereClause(Product.find(), req.query).search().filter();
	//products contains all the filtered products

	let products = await productsObj.base; // products = Product.find()

	const filteredProductNumber = products.length;

	//adding "skip" & "limit" values without using function inside whereClause
	// products.limit(..).skip(..);

	//using the function pager() of whereClause
	productsObj.pager(resultPerPage);
	products = await productsObj.base.clone();
	//mongoose does not allowed chained query (executing same query object twice)going on like here :	.find() if we do it will throw an error "Query was already executed", but if we want to do that we have to use query.clone() to clone it and let it execute twice

	console.log("filter " + filteredProductNumber);
	res.status(200).json({
		success: true,
		products,
		filteredProductNumber,
		totalProductNumber
	});
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new CustomError('There is no such product found', 401));
	}

	res.status(200).json({
		success: true,
		product
	});
});

exports.addReview = BigPromise(async (req, res, next) => {
	const { rating, comment, productId } = req.body;

	const review = {
		user: req.user._id,
		name: req.user.name,
		rating: Number(rating),
		comment
	};

	const product = await Product.findById(productId);

	const isAlreadyReviewed = product.reviews.find(
		(review) => review.user.toString() === req.user._id.toString()
		//._id is BSON, so we have to convert it to string
	);

	if (isAlreadyReviewed) {
		//if user have already reviewed the product update the reviews
		product.reviews.forEach((review) => {
			if (review.user.toString() === req.user._id.toString()) {
				review.comment = comment;
				review.rating = rating;
			}
		});
	} else {
		product.reviews.push(review);
		product.numberOfReviews = product.reviews.length;
	}

	//adjust ratings : avg of all ratings on product
	product.rating = product.reviews.reduce((sum, item) => item.rating + sum, 0) / product.reviews.length; //0 is initiall value of sum

	await product.save({ validateBeforeSave: false });

	res.status(200).json({
		success: true,
	});
});

exports.deleteReview = BigPromise(async (req, res, next) => {
	// const {productId} = req.body;
	const { productId } = req.query;

	const product = await Product.findById(productId);

	const reviews = product.reviews.filter(
		(rev) => rev.user.toString() === req.user._id.toString()
	);
	//reviews contain those which are not to be deleted

	const numberOfReviews = reviews.length;

	product.rating = product.reviews.reduce((sum, item) => item.rating + sum, 0) / product.reviews.length;

	//update the product
	await Product.findByIdAndUpdate(productId, {
		reviews,
		rating,
		numberOfReviews
	}, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		success: true,
	});
});

exports.getOnlyReviewsOfOneProduct = BigPromise(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	res.status(200).json({
		success: true,
		reviews: product.reviews
	});
});


//admin only controllers
exports.adminAllProducts = BigPromise(async (req, res, next) => {
	const products = await Product.find();

	res.status(200).json({
		success: true,
		products
	});
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
	let product = await Product.findById(req.params.id);
	let imagesArray = [];

	if (!product) {
		return next(new CustomError('There is no such product found', 401));
	}

	console.log(req.files);
	if (req.files) {
		//destroy the existing files
		console.log("inside req.file");
		for (let index = 0; index < product.photos.length; index++) {
			const result = await cloudinary.uploader.destroy(product.photos[index].id);
		}

		//upload new files
		for (let index = 0; index < req.files.photos.length; index++) {
			console.log("uploading new pics");

			const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
				folder: "products" //can go into .env
			});

			imagesArray.push({
				id: result.public_id,
				secure_url: result.secure_url
			});
		}
		req.body.photos = imagesArray;
	} else {
		console.log("else of req.file");
	}

	product = await Product.findOneAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});

	res.status(200).json({
		success: true,
		product
	});
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new CustomError('There is no such product found', 401));
	}

	for (let index = 0; index < product.photos.length; index++) {
		await cloudinary.uploader.destroy(product.photos[index].id);
	}

	await product.remove();

	res.status(200).json({
		success: true,
		message: "product was deleted!"
	});
});



