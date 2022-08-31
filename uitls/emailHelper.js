const nodemailer = require('nodemailer');

const mailer = async (option) => {

	// create reusable transporter object using the default SMTP transport
	//this host,port and all are copied from "Mailtrap"
	let transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER, // generated ethereal user
			pass: process.env.SMTP_PASS, // generated ethereal password
		},
	});

	const message = {
		from: 'bhagya@gmail.com', // sender address
		to: option.email, // list of receivers
		subject: option.subject, // Subject line
		text: option.message, // plain text body
	};

	await transporter.sendMail(message);
};

module.exports = mailer;