const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		isAsync: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid mail'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

// Updates toJSON method

UserSchema.methods.toJSON = function () {

	// Instance methods get called with the individual document
	var user = this;
	var userObject = user.toObject();

	return _.pick(userObject, ['_id','email']);
};

// Create generateAuthToken method

UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'somesecret').toString();

	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	});
};

// 

UserSchema.statics.findByToken = function (token) {

	// Model methods get called with the model.
	var User = this;
	var decoded;

	try{
		decoded = jwt.verify(token, 'somesecret');
	} catch (e){
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.statics.findByCredentials = function (email,password) {
	var User = this;

	return User.findOne({email}).then((user) => {
		if(!user){
			return Promise.reject();
		}

		return new Promise((resolve, reject) => {
			// Compare password and user.password
			bcrypt.compare(password, user.password, (err, res) => {

				if(res) resolve(user);
				else{
					return reject()
				}
			});
		});
	})
};


UserSchema.pre('save', function (next){
	var user = this;

	// checks if password is modified
	if(user.isModified('password')){

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});


var User = mongoose.model('User', UserSchema);

module.exports = {User};