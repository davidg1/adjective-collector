const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");

const Adjective = require('./nested/adjective');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  adjectiveCollection: {type: [Adjective.schema], default: [{word: 'fun', userCreatedExample: 'Collecting adjectives is fun.'}, {word: 'amazing', userCreatedExample: 'This app is an amazing tool for collecting adjectives.'}]}
}, {
  // This option setting is needed to use the Mongoose Array.push method
  //  See   https://github.com/Automattic/mongoose/issues/4455
  usePushEach: true
});

// Using Mongoose pre hook middleware: Prior to saving a user document in the database,
// salt and hash a new or modified password.
// IMPORTANT!!:  Do not use an arrow function for the 2nd argument of pre() because you
// do not want the callback's    this   to be bound to the   this    value of the enclosing
// execution context.
userSchema.pre('save', function(next) {
  // In Mongoose document middleware functions,  this  refers to the document.
  const that = this;

  // Use the Mongoose isModified method to check if the password is new or modified
  if (!this.isModified('password')) {
    // "early return pattern" as described in Mongoose middleware documentation
    return next();
  }

  // Asynchronously generate the custom salt and if successful then hash the password.
  // If next is called with the err parameter, the error is passed to the callback of
  // the save() method.
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if (err) {
      // "early return pattern" as described in Mongoose middleware documentation
      return next(err);
    }
    bcrypt.hash(that.password, salt, null, (err, hashedPassword) => {
      if (err) {
        // "early return pattern" as described in Mongoose middleware documentation
        return next(err);
      }
      that.password = hashedPassword;
      next();
    });
  });
});


// Add a custom user document instance method to verify a password
// IMPORTANT!!:  Do not use an arrow function for the assignment to the verifyPassword
// instance method because you do not want the callback's    this   to be bound to the
//   this    value of the enclosing execution context.
userSchema.methods.verifyPassword = function (attemptedPassword, done) {
  bcrypt.compare(attemptedPassword, this.password, (err, result) => {
    done(err, result);
  });
};


module.exports = mongoose.model('User', userSchema);
