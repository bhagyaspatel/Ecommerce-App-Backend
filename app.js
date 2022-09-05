require('dotenv').config();
const express = require("express");
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

//for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//temp check
app.set("view engine", "ejs");

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: "/tmp/"
}));

//morgan middleware : has to be written before any of the routes : after injecting this middleware stop the server once and restart it again
app.use(morgan("tiny"));


// import all routes here
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');


//router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);

app.get('/signuptest', (req, res) => {
	res.render('signuptest');
});


module.exports = app;