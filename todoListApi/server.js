var express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  User = require('./api/models/userSchema'),
  Message = require('./api/models/messageSchema'),
  bodyParser = require('body-parser');

  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://127.0.0.1:27017', { useMongoClient: true });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  var routes = require('./api/routes/routes');
  routes(app);

  app.listen(8080);

console.log('todo list RESTful API server started on: 8080');

