//initiate all the global variables
'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var crypto = require('crypto');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var fs = require('fs');

//this function is used to find every user in the database
exports.list_users = function(req, res) {
  //find all users in the database
  User.find({}, function(err, user) {
    //if an error occurs send the error
    if (err)
      res.send(err);
    //no error send the array of all users
    res.json(user);
  });
};

//this function is used to find ever user in the database
exports.list_messages = function(req, res) {
  //find all messages in the database
  Message.find({}, function(err, message) {
    //if theres an error return the error
    if (err)
      res.send(err);
    //else return the message
    res.json(message);
  });
};

//this function is used to create and insert a user into the database
exports.create_user = function(req, res) {
  //variable used to store the username
  var newUsername = req.body.username;

  //variable used to store the randomly generated salt that will be used to appended to the end of the string
  var newSalt = crypto.randomBytes(256).toString('hex');

  //variable used to store the hashed password of the user
  //the salt is added to the end of the password and then hashed using sha512 10000 times, and returns a 256 bit key at the end
  var newPassword = crypto.pbkdf2Sync(req.body.password, newSalt, 10000, 256, 'sha512');

  //varibale used to store all the information in json notation
  var body = {username:newUsername,  password:newPassword, salt:newSalt};

  //variable used to store the information as User model
  var newUser = new User(body);
  //save the newUser into the database
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

//this function returns a user given an id
exports.get_user = function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err)
      res.send(err);
    //return the user if no error
    res.json(user);
  });
};

//this function returns a message given an id
exports.a_message = function(req, res) {
  Message.findById(req.params.messageId, function(err, message) {
    if (err)
      res.send(err);
    //return a message if no error
    res.json(message);
  });
};

//this function is used to update a user with a given id, and a user information
exports.update_user = function(req, res) {
  User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, user) {
    if (err)
      res.send(err);
    //return the new user
    res.json(user);
  });
};

//this fucntion deletes a user given a user id
exports.delete_user = function(req, res) {
  //remove a user from the database that matches the id
  User.remove({
    _id: req.params.userId
  }, function(err, user) {
    if (err)
      res.send(err);
    //give success message if no error
    res.json({ message: 'User successfully deleted' });
  });
};

//this functions deletes a message given a message id
exports.delete_message = function(req, res) {
  //remove a message from the database that matches the id
  Message.remove({ _id: req.params.messageId }, function(err, user) {
    if(err)
      res.send(err);
    //give succes message if no error
    res.json({ message: 'Message deleted' });
  });
};

//this function will be used to login the user and give them a JWT if their information is correct
exports.login = function(req, res) {
  //search for the user  that matches usernames
  var userInTable = User.findOne({username:req.body.username}, function(err,user) {
	//no suer is found
	if(user==null)
		res.json('Error');
	//this varibale is used to store the salt of the user
	var salt = user.salt;
	//this variable is used to store how many iteration pbkdf2 will do
      	var iterations = 10000;
	//this variable store the hashed password from the database
	var hashed = user.password;
	//this variable will hold the new has that was made with the password given
  	var verify = crypto.pbkdf2Sync(req.body.password, salt, iterations, 256, 'sha512');
	//if verify and the user's saved password is stored then tey correct information was given
	if(verify == user.password) {
		//this variabel will hold the private key to be read in
		var privateKey = '';
		//this fucntion call is sued tp read in the private key
		fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
			if (err) {
				res.json('Error reading file');
			}
			privateKey = data;
			console.log(privateKey);
			//create a token that will be sued to verify the user and which user
	                var token = jwt.sign({ username: req.body.username, userId: user._id }, privateKey, { expiresIn: "30 days"});
			res.json(token);

		});
	}
	//this means incorrect information was given
	else
	{
		res.json('Error');
	}
	})
}

//this function is used to get a message from the database given the sender and the receiver
exports.get_message = function(req, res) {
	//this variable holds the jwt token that was given to us
	var jwtoken = req.body.t;
	//this varaibale holds the sender given from the parameters
	var msender = req.body.sender;
	//this variable will hold the private key that is read in
	var privateKey = '';
	//this function call will read in the private key file
	fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
                        if (err) {
                                res.json('Error reading file');
                        }
			//store the private key data
                        privateKey = data;
                        console.log(privateKey);
			//this function is used to verify that the jwt is correct and who it comes from
                        jwt.verify(jwtoken, privateKey, function(err2,token) {
			if(err2) {
				res.json('Error, please input a correct JWT');
			} 
			//find the a message from the database that has the given sender and receiver
			else {
				Message.findOneAndUpdate({receiver: token.username, isRead: false, sender: msender}, {isRead: true}, {new: true}, function(err3, cmessage) {
					if(err3){
						res.json('No message');
					}
					//if no error retrn the message
					else  {
						//if message is null then there is none
						if(cmessage == null)
						{
							res.json(cmessage);
						}
						//if message is not null means there is a message so return it
						else
							res.json(cmessage.message);
					}
				});
			}
		});
        });
}

//this function is used to make a message and add it into the database given a certain message, receiver and sender
exports.set_message = function(req, res) {

	//this variable will hold the jwt verification of the sender
        var jwtoken = req.body.t;
        //this variable will hold the name of the receiver 
        var mreceiver = req.body.receiver;
        //this variable will hold the message of the receiver which would be a json
	var smessage = req.body.message;
        //this variable will later hold the private which will be used to verify the jwt
        var privateKey = '';
        //this function call is used to read in the private key
        fs.readFile('/var/www/html/todoListApi/private.txt', 'utf8', function (err,data) {
                        if (err) {
                                res.json('Error reading file');
                        }
                        privateKey = data;
                        console.log(privateKey);
                        //this function call will be used to verify the jwt by using the private key
                        jwt.verify(jwtoken, privateKey, function(err,token) {
                        //if not a valid jwt send error message
			if(err) {
                                res.json('Error, please input a correct JWT');
                        }
			//valid jwt token so create the message
                        else {
				//create the body of the message using the information from the jwt and the parameters passed
                                var body = {sender: token.username, message: smessage, receiver: mreceiver};
				//create a message instande using the body
				var newMessage = new Message(body);
				//save the message into the database
				newMessage.save(function(err, user) {
					if(err)
						res.send(err);
					
                                res.json(user);
				});
                        }
                });
        });
}

