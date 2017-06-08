var nodemailer 	= require('nodemailer');

// config nodemailer
var smtpConfig = {
	host: 'debugmail.io',
    port: 25,
    auth: {
        user: 'ren.amelie@gmail.com',
        pass: '3b868160-fac9-11e6-9f88-e585862dca14'
    },
	tls: {rejectUnauthorized: true},
};

var transporter = nodemailer.createTransport(smtpConfig);

module.exports = transporter;