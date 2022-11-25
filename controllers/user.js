const User = require('../models/user');
const sortBy = require('lodash.sortby');

exports.displayCreateAccountForm = (req, res) => res.render('create-account');

exports.handleCreationOfAccount = (req, res, next) =>  {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (user) {
      req.flash('error', 'That username is already taken. Please enter a different one.');
      return res.redirect("/create-account");
    }

    const newUser = new User({
      username: username,
      password: password
    });

    newUser.save((err, user) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });
}

exports.authenticateUserAfterAccountCreation = passport => {
  return passport.authenticate('local', {
    successRedirect: '/account-created',
    failureRedirect: '/create-account',
    failureFlash: true,
  });
}

exports.displayAccountCreatedConfirmation = (req, res) => res.render('account-created');

exports.displaySignInForm = (req, res) => res.render('sign-in');

exports.handleAuthenticatingUser = passport => {
  return passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sign-in',
    failureFlash: true,
    successFlash: true
  });
}

exports.handleLoggingOut = (req, res) => {
  req.logout();
  res.redirect('logged-out');
}

exports.displayLoggedOutConfirmation = (req, res) => res.render('logged-out');

exports.getUserAdjectiveCollection = (req, res) => {
  User.findOne({username: req.user.username}).exec()
    .then(user => {
      //sort the collection in alphabetically using Lodash sortBy
      sortedAdjectiveCollection = sortBy(user.adjectiveCollection, 'word');
      res.render('adjective-collection', {adjectiveCollection: sortedAdjectiveCollection});
    })
    .catch(error => {
      console.log(error);;
    });
}

exports.addAdjectiveToUserCollection = (req, res) => {
  // Sanitize and trim form data
  const controlsToBeSanitized = ['wordToBeAdded', 'exampleUsage'];
  controlsToBeSanitized.forEach(controlName => req.body[controlName] = req.sanitize(req.body[controlName]).trim());

  // Check if adjective is already in the user's collection
  const adjectiveCollection = req.user.adjectiveCollection;
  const adjectiveToBeAdded = req.body['wordToBeAdded'];
  
  if (adjectiveCollection.find(adjectiveInfo => adjectiveToBeAdded === adjectiveInfo.word)) {
    res.send('already in collection');
  } else {
    const adjToAddProperties = {
      word: req.body['wordToBeAdded'],
      userCreatedExample: req.body['exampleUsage']
    };

    req.user.adjectiveCollection.push(adjToAddProperties);

    req.user.save()
      .then(wordAdded => {
      res.end();
      })
      .catch(error => {
        console.log(error);
      });
  }
}

exports.RemoveAdjectiveFromUserCollection = (req, res) => {
  // Remove the adjective subdocument from the collection of the user document object
  req.user.adjectiveCollection.id(req.body.objectIdOfAdjectiveToBeDeleted).remove();

  // Save the modified user document to MongoDB
  req.user.save()
    .then(() => {
    res.end();
    })
    .catch(error => {
      console.log(error);
    });
}
