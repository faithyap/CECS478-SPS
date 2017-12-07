
'use strict';
module.exports = function(app) {
  var todoList = require('../controllers/Controller');

  // todoList Routes
  app.route('/user')
    .get(todoList.list_users)
    .post(todoList.create_user);


  app.route('/user/:userId')
    .get(todoList.get_user)
    .put(todoList.update_user)
    .delete(todoList.delete_user);

  app.route('/user/login')
   .post(todoList.login);

  app.route('/getm')
   .get(todoList.list_messages)
   .post(todoList.get_message);

  app.route('/getm/:messageId')
   .delete(todoList.delete_message)
   .get(todoList.a_message);

  app.route('/setm')
   .post(todoList.set_message);
};
