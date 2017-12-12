'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageScheme = new Schema({
	sender: {
		type: String,
		required: 'Enter the name of the sender'
	},
	receiver: {
		type: String,
		required: 'Enter the name of the receiver'
	},
	message: {
		type: String,
		required: 'Enter the encrypted message'
	},
	isRead: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Message', messageScheme);
