//This application file holds the routes for the url
'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/Controller');

  // todoList Routes
  //this will be used to get a list of all the users and the post to create a user
  app.route('/user')
    .get(todoList.list_users)
    .post(todoList.create_user);

  //these routes will be used to get a specific user, update a specific user,
  // and deleting a specfifc user based on the id of the user
  app.route('/user/:userId')
    .get(todoList.get_user)
    .put(todoList.update_user)
    .delete(todoList.delete_user);
  
  //these routes will be used to login and return the JWT authenticating the suer
  app.route('/user/login')
   .post(todoList.login);

  //These routes will be used to get all the messages or a specific message from specific sender
  app.route('/getm')
   .get(todoList.list_messages)
   .post(todoList.get_message);

  //These routes will be used to get a specific message or delete a specific message 
  //from a given id
  app.route('/getm/:messageId')
   .delete(todoList.delete_message)
   .get(todoList.a_message);

  //these routes will be used to put a message into the database
  app.route('/setm')
   .post(todoList.set_message);
};
