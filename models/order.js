const mongoose = require('mongoose');

// shippingInfo{ }
// user
// paymentInfo{ }
// taxAmmount;
// shippingAmmount;
// totalAmmount;
// orderStatus;
// delieveredAt;
// createdAt
// payment{ }
// --------------------------
// 	orderItems[{}]
// 	- name
// 	- quantity
// 	- image[0]
// 	- price
// 	- product;

const orderSchema = new mongoose.Schema({
	shippingInfo: {
		address: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true
		},
		postalCode: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		country: {
			type: String,
			required: true
		}
	},
	user: {
		type: mongoose.Schema.ObjectId, //mongoose.Schema.Types.ObjectId : same output
		ref: 'User',
		required: true
	},
	orderItems: [
		{
			name: {
				type: String,
				required: true
			},
			quantity: {
				type: Number,
				required: true
			},
			image: {
				type: String,
				required: true
			},
			price: {
				type: Number,
				required: true
			},
			product: {
				type: mongoose.Schema.ObjectId,
				ref: 'Product',
				required: true
			}
		}
	],
	paymentInfo: {
		id: {
			type: String,
		}
	},
	taxAmount: {
		type: Number,
		required: true
	},
	shippingAmount: {
		type: Number,
		required: true
	},
	totalAmount: {
		type: Number,
		required: true
	},
	orderStatus: {
		type: String,
		default: "processing",
		enum: {
			values: ['processing', 'shipping', 'packing', 'arriving soon'],
			message: "The order status must be valid."
		},
		required: true,
	},
	deliveredAt: {
		type: Date,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

exports.module = mongoose.model('Order', orderSchema);
