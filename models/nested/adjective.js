const mongoose = require('mongoose');

const adjectiveSchema = new mongoose.Schema ({
  word: String,
  'userCreatedExample': String
});

module.exports = mongoose.model('Adjective', adjectiveSchema);
