const app = require('./app');
const connectWithDb = require('./config/db');
const cloudinary = require('cloudinary').v2;

//connect with database
connectWithDb();

//cloudinary config : we can also write this in userController but doing it here makes more sense since this configuration has to be done as soon as our database is connected
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
	secure: true
});


app.listen(process.env.PORT, () => {
	console.log(`Server is running at the port :${process.env.PORT}`);
});