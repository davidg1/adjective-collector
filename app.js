const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');

const User = require('./models/user');

const indexRoutes = require('./routes/index');
const dictionaryRoutes = require('./routes/dictionary');
const userRoutes = require('./routes/user')(passport);

const PORT = process.env.PORT || 3000;


// /************************* MongoDB/Mongoose Setup  ****************************/
const url = process.env.MONGODB_URI;

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true 
};

mongoose.connect(url, connectionParams)
    .then(() => {
      console.log('Connected to the database.')
    })
    .catch(err => {
      console.error(`Error connecting to the database. ${err}`);
    });


//Set the view engine to EJS
app.set('view engine', 'ejs');


app.use(helmet());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressSanitizer());

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: url })
}));

app.use(flash());


/**************************** Passport Setup **********************************/
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport.js')(passport);

app.use((req, res, next) => {
  // Passport will set req.user to an authenticated user
  res.locals.currentUser = req.user;
  res.locals.errorFlashMessages = req.flash("error");
  res.locals.successFlashMessages = req.flash("success");
  next();
});


/*********************************** Routes ***********************************/
app.use('/', indexRoutes);
app.use('/', dictionaryRoutes);
app.use('/', userRoutes);

app.use((req, res) => res.status(404).render('not-found'));


/****************************** Error Handler *********************************/
app.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).send('Server Error!')
});


app.listen(PORT, () => console.log(`\nAdjective Collector App listening on port ${PORT}!`));
