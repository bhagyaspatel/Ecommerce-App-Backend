const Order = require('../models/product');
const Product = require('../models/product');
const BigPromise = require('../middleware/bigPromise');
const customError = require('../uitls/customErrors');

exports.createOrder = BigPromise; (async (req, res, next) => {
	const { shippingInfo, orderItem, paymentInfo, taxAmount, shippingAmount, totalAmount } = req.body;

	const order = await Order.create({
		shippingInfo,
		orderItem,
		paymentInfo,
		taxAmount,
		shippingAmount,
		totalAmount,
		user: req.user._id
	});

	res.status(200).json({
		success: true,
		order
	});
});

exports.getOneOrder = BigPromise; (async (req, res, next) => {
	//.populate('<field which we want to be drilled down furthe>', '<which properties we want to have in it')...'user' is the name of the property inside the "order" object.
	const order = await Order.findById(req.params.id).populate('user', 'name email');

	if (!order) {
		return next(new customError('Please check order id', 401));
	}

	res.status(200).json({
		success: true,
		order
	});
});

exports.getMyAllOrders = BigPromise; (async (req, res, next) => {
	const orders = await Order.find({ user: req.user._id });

	if (!orders) {
		return next(new customError('You dont have any previous orders', 401));
	}

	res.status(200).json({
		success: true,
		order
	});
});


//admin routes
exports.admingGetAllOrders = BigPromise; (async (req, res, next) => {
	const orders = await Order.find();

	if (!orders) {
		return next(new customError('You dont have any previous orders', 401));
	}

	res.status(200).json({
		success: true,
		orders
	});
});

exports.adminUpdateOrders = BigPromise; (async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (order.orderStatus === "Delivered") {
		return next(new customError('You dont have any previous orders', 401));
	}

	order.orderStatus = req.body.orderStatus;

	order.orderItems.foreach(async (prod) => {
		await updateProductStock(prod.product, prod.quantity);
	});

	await order.save();

	res.status(200).json({
		success: true,
		orders
	});
});

async function updateProductStock(productId, quantity) {
	const product = await Product.findById(productId);

	if (!product) {
		return next(new customError('No such product exist', 401));
	}

	product.stock = product.stock - quantity;

	await product.save({ validateBeforeSave: true });
}

exports.admingDeleteOrders = BigPromise; (async (req, res, next) => {
	const order = await Order.findById(req.params.id);

	if (!order) {
		return next(new customError('No such order exist', 401));
	}

	await order.remove();

	res.status(200).json({
		success: true
	});
});