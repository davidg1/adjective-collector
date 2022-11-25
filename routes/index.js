const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');

/**************************** Display Home Page *******************************/
router.get('/', indexController.displayHomePage);

module.exports =  router;
