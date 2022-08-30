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

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie and file middleware
app.use(cookieParser());
app.use(fileUpload());

//morgan middleware : has to be written before any of the routes : after injecting this middleware stop the server once and restart it again
app.use(morgan("tiny"));


// import all routes here
const home = require('./routes/home');



//router middleware
app.use('/api/v1', home);


module.exports = app;