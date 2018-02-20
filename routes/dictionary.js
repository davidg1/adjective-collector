const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionary');

/************* Get Adjective Definitions from Worknik Dictionary **************/
router.get('/get-adjective-definitions', dictionaryController.getAdjectiveDefinitionsFromDictionary);

module.exports =  router;
