'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var crypto = require('crypto');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var fs = require('fs');

exports.list_users = function(req, res) {
  User.find({}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.list_messages = function(req, res) {
  Message.find({}, function(err, message) {
    if (err)
      res.send(err);
    res.json(message);
  });
};


exports.create_user = function(req, res) {
  var newUsername = req.body.username;

  var newSalt = crypto.randomBytes(256).toString('hex');

  var newPassword = crypto.pbkdf2Sync(req.body.password, newSalt, 10000, 256, 'sha512');

  var body = {username:newUsername,  password:newPassword, salt:newSalt};

  var newUser = new User(body);
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.get_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.a_message = function(req, res) {
  Message.findById(req.params.messageId, function(err, message) {
    if (err)
      res.send(err);
    res.json(message);
  });
};

exports.update_user = function(req, res) {
  User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_user = function(req, res) {


  User.remove({
    _id: req.params.userId
  }, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'User successfully deleted' });
  });
};

exports.delete_message = function(req, res) {

  Message.remove({ _id: req.params.messageId }, function(err, user) {
    if(err)
      res.send(err);
    res.json({ message: 'Message deleted' });
  });
};

exports.login = function(req, res) {
  var userInTable = User.findOne({username:req.body.username}, function(err,user) {
	if(user==null)
		res.json(user);
	var salt = user.salt;
      	var iterations = 10000;
	var hashed = user.password;
  	var verify = crypto.pbkdf2Sync(req.body.password, salt, iterations, 256, 'sha512');
	if(verify == user.password) {
		var privateKey = '';
		fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
			if (err) {
				res.json('Error reading file');
			}
			privateKey = data;
			console.log(privateKey);
	                var token = jwt.sign({ username: req.body.username, userId: user._id }, privateKey, { expiresIn: "30 days"});
			res.json(token);

		});
	}
	else
	{
		res.json('Incorrect username or password, please enter it again.');
	}
	})
}

exports.get_message = function(req, res) {

	var jwtoken = req.body.t;
	var msender = req.body.sender;
	var privateKey = '';
	fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
                        if (err) {
                                res.json('Error reading file');
                        }
                        privateKey = data;
                        console.log(privateKey);
                        jwt.verify(jwtoken, privateKey, function(err2,token) {
			if(err2) {
				res.json('Error, please input a correct JWT');
			} 
			else {
				Message.findOneAndUpdate({receiver: token.username, isRead: false, sender: msender}, {isRead: true}, {new: true}, function(err3, cmessage) {
					if(err3){
						res.json('No message');
					}
					else  {
						if(cmessage == null)
						{
							res.json(cmessage);
						}
						else
							res.json(cmessage.message);
					}
				});
				//res.json(token);
			}
		});
        });
}

exports.set_message = function(req, res) {

        var jwtoken = req.body.t;
        var mreceiver = req.body.receiver;
	var smessage = req.body.message;
        var privateKey = '';
        fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
                        if (err) {
                                res.json('Error reading file');
                        }
                        privateKey = data;
                        console.log(privateKey);
                        jwt.verify(jwtoken, privateKey, function(err,token) {
                        if(err) {
                                res.json('Error, please input a correct JWT');
                        }
                        else {
                                var body = {sender: token.username, message: smessage, receiver: mreceiver};
				var newMessage = new Message(body);
				newMessage.save(function(err, user) {
					if(err)
						res.send(err);
					
                                res.json(user);
				});
                        }
                });
        });
}

