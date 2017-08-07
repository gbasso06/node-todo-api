const mongoose = require('mongoose');
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

var User = mongoose.model('User', UserSchema);

module.exports = {User};