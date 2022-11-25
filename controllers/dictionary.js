const axios = require('axios');

exports.getAdjectiveDefinitionsFromDictionary = (req, res) => {
  const adjectiveInfo = {};

  const requestURL = `http://api.wordnik.com:80/v4/word.json/${req.query['word']}/definitions`;
  
  const requestObj = {
    params: {
      api_key: process.env.WORDNIK_API_KEY,
      partOfSpeech: 'adjective'
    },
    validateStatus: status => (status >= 200 && status < 300) || status === 404
  };

  axios.get(requestURL, requestObj)
    .then(response => {
      if ((response.status !== 404) && (response.data.length > 0)) {
        adjectiveInfo.data = response.data;
        adjectiveInfo.adjFound = true;
      } else {
        adjectiveInfo.adjFound = false;
      }
      res.send(adjectiveInfo)
    })
    .catch(error => {
      console.log(error);
    });
}
