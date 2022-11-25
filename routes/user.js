module.exports = function(passport) {
  const express = require('express');
  const router = express.Router();
  const userController = require('../controllers/user');
  const middleware = require('../middleware/index')

  /********************** Creating User Account Routes ************************/
  router.get('/create-account', userController.displayCreateAccountForm);
  router.post('/create-account', userController.handleCreationOfAccount, userController.authenticateUserAfterAccountCreation(passport));
  router.get('/account-created', userController.displayAccountCreatedConfirmation);


  /************************* Signing In User Routes ***************************/
  router.get('/sign-in', userController.displaySignInForm);
  router.post('/sign-in', userController.handleAuthenticatingUser(passport));


  /************************* Logging User Out Routes **************************/
  router.get('/log-out', userController.handleLoggingOut);
  router.get('/logged-out', userController.displayLoggedOutConfirmation);


  /*************** Get a User's Nested Adjective Collection *******************/
  router.get('/user-adjective-collection', middleware.isLoggedIn, userController.getUserAdjectiveCollection);


  /****************** Add an Adjective to User's Collection *******************/
  router.post('/add-adjective-to-user-collection', userController.addAdjectiveToUserCollection);


  /************** Remove an Adjective from the User's Collection **************/
  router.post('/remove-adjective-from-user-collection', userController.RemoveAdjectiveFromUserCollection);

  return router;
}
