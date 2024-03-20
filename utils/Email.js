const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			service: 'gmail',
			port: 587,
			secure: false,
			auth: {
				user: 'phalpanhanyta12d@gmail.com',
				pass: 'Nyta12d12345',
			},
		});

		await transporter.sendMail({
			from: 'phalpanhanyta12d@gmail.com',
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};