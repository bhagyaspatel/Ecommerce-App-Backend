const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		require: [true, 'Please provide name of the product'],
		trim: true, //to cut the extra spaces at the end of the product name
		maxlength: [120, 'Product name must not be more than 120 characters']
	},
	price: {
		type: Number,
		require: [true, 'Please provide price of the product'],
		maxlength: [5, 'Product price must not be more than 5 digits']
	},
	description: {
		type: String,
		require: [true, 'Please provide description of the product'],
	},
	photos: [
		{
			id: {
				type: String,
				require: true
			},
			secure_url: {
				type: String,
				require: true
			}
		}
	],
	category: {
		type: String,
		require: [true, 'Please select category of the t-shirts'],
		enum: {
			values: ["shortsleeve", "longsleeve", "sweatshirts", "hoodies"],
			message: "Please select category ONLY from : t-shirts from short-sleeve, long-sleeve, sweat-shirts, hoodies"
		}
	},
	//stock updation is handeled in order controller in adminUpdateOrder
	stock: {
		type: Number,
		require: true
	},
	brand: {
		type: String,
		require: [true, 'Please add a brand of clothing']
	},
	rating: {
		type: Number,
		default: 0
	},
	numberOfReviews: {
		type: Number,
		default: 0
	},
	reviews: [
		{  //injected one schema into another 
			user: {
				type: mongoose.Schema.ObjectId,
				ref: 'User',
				required: true
			},
			name: {
				type: String,
				require: true
			},
			rating: { //can also have enum here so that rating is b/w 1 and 5
				type: Number,
				require: true
			},
			comment: { //can also have enum here so that rating is b/w 1 and 5
				type: String,
				require: true
			}
		}
	],
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		require: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});



module.exports = mongoose.model('Product', productSchema);