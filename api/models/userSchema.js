'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	username: {
		type: String,
		required: 'Enter a username'
	},
	password: {
		type: String,
		required: 'Enter password'
	},
	salt: {
		type: String
	}
});

module.exports = mongoose.model('User', User);
