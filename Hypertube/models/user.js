var bcrypt = require('bcrypt')
var nodemailer = require('nodemailer')


module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("user", {
        login : {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            },
            unique: true
        },
        password : {
            type: DataTypes.STRING,
            validate: {
                    notEmpty: true,
                len: {
                    args : [8,Infinity],
                    msg  : "Your password must have 8+ characters"
                },
                notEmpty: true
            }
        },
        email : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: {
                    msg  : "Must be an email valid"
                },
                notEmpty: true
            },
            unique: true
        },
        first_name : {
            type: DataTypes.STRING
        },
        last_name : {
            type: DataTypes.STRING
        },
        picture : {
            type: DataTypes.STRING
        },
        lang    : {
            type: DataTypes.STRING,
            defaultValue: 'en'
        }
    });

    User.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        // return (password);
    };

    User.validPassword = function(password, user_password) {
        return bcrypt.compareSync(password, user_password);
        // return (password == user_password ? true : false);
    };

    User.forgetPassword = function(email, cb) {
		var transporter = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: 'matcha.vmariot@gmail.com',
								pass: 'vmariot42'
							}
						})
						
		var new_password = Math.random().toString(36).slice(-10)
		
        var mailOptions = {
            from: '<matcha.vmariot@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'You forgot your password ?', // Subject line
            text: 'Hello,\nYou forgot your password ? No problem, I can help you ! \n Your new password is : '
                +new_password+'\nDon\'t forget him, or change him in settings section' // plain text body
        }
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error)
                cb (null)
            }
            cb (new_password);
        })
	}

    return (User);
};