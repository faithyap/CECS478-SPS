//creat theinstances for express, mongo, the models and the body parser for json
var express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  User = require('./api/models/userSchema'),
  Message = require('./api/models/messageSchema'),
  bodyParser = require('body-parser');
  
  //create global promise to save on mongo and the connection to the mongo database
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://127.0.0.1:27017', { useMongoClient: true });

  //explain how the app will parse through the json and urlencoded requests
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  
  //define where the routes are for the app
  var routes = require('./api/routes/routes');
  routes(app);

  //define the port for the server
  app.listen(8080);

//message on console when server successfully starts
console.log('todo list RESTful API server started on: 8080');

