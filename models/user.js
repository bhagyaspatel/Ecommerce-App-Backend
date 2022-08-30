const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: ['true', "Please provide a name"],
		maxlength: [40, 'Name should be under 40 characters']
	},
	email: {
		type: String,
		required: ['true', "Please provide an email"],
		validate: [validator.isEmail, 'Please enter the email in correct format'],
		unique: true
	},
	password: {
		type: String,
		required: ['true', "Please provide a password"],
		validate: [validator.isStrongPassword, 'Please provide the strong password containing 1 lower, 1 uppercase characters, 1 symbol and 1 number and of aleast 6 characters'],
		select: false //whenever we try to bring in the password we dont want to be visible : same as what we used to do by "user.password = undefined"
	},
	role: {
		type: String,
		default: 'user'
	},
	photo: {
		id: {
			type: String,
			required: true
		},
		secure_url: {
			type: String,
			required: true
		}
	},
	forgotPasswordToken: String,
	forgotPasswordExpiry: Date,
	createdAt: {
		type: Date,
		defualt: Date.now //dont mention like "Date.now()" because we dont want the date now we will execute it later
	}
});

//encrypt password before save - HOOKs (we have used PRE HOOK)
//docs : 
// https://mongoosejs.com/docs/api/document.html#document_Document-$isModified
// https://stackoverflow.com/questions/50581825/ismodified-and-pre-save-mongoose-nodejs
userSchema.pre('save', async function (next) {

	if (!(this.isModified('password'))) //if we dont specify this evrytime there is a change in the schema of a user (ex changing the role from 'user' to 'manager', this function of encryption will run)
		return next();

	this.password = await bcrypt(this.password, 10);

	//validate the password with passed on user password
	userSchema.methods.isValidatedPassword = async function (userSendPassword) {
		return await bcrypt.compare(userSendPassword, this.password);
	};

	//create and return jwt token
	userSchema.methods.getJwtToken = async function () {
		return jwt.sign(
			{ id: this._id },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRY }
		);
	};

	module.exports = mongoose.model(User, userSchema);