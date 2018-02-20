const axios = require('axios');

exports.getAdjectiveDefinitionsFromDictionary = (req, res) => {
  const adjectiveInfo = {};

  const requestURL = 'http://api.wordnik.com:80/v4/word.json/' + req.query['word'] + '/definitions';

  axios.get(requestURL, {
      params: {
        api_key: process.env.WORDNIK_API_KEY,
        limit: 10,
        partOfSpeech: 'adjective'
      }
    })
    .then((response) => {
      if (response.data.length > 0) {
        adjectiveInfo.data = response.data;
        adjectiveInfo.adjFound = true;
      } else {
        adjectiveInfo.adjFound = false;
      }
      res.send(adjectiveInfo)
    })
    .catch((error) => {
      console.log(error);
    });
}
