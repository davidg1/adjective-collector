// Placed code in an IIFE to not pollute the global space
(function() {

  /****************************************************************************/
  /******************************** Index view ********************************/
  /****************************************************************************/
  if (document.getElementById('adjective-search-container')) {
    var adjectiveSearchForm = document.getElementById('adjective-search-form');
    var adjectiveInput = document.getElementById('adjective-input');
    var getAdjectiveInfoButton = document.getElementById('get-adjective-info-button');
    var adjectiveInfoContainer = document.getElementById('adjective-info-container');
    var collectionPromptsRow = document.getElementById('collection-prompts-row');
    var adjectiveInfoHeader = document.getElementById('adjective-info-header');
    var adjectiveInfo = document.getElementById('adjective-info');

    adjectiveSearchForm.addEventListener('submit', function (evt) {
      evt.preventDefault();
    });

    // Check if LOGGED IN index view
    if (document.getElementById('logged-in-group')) {
      var addAdjectiveCheckbox = document.getElementById('add-adjective-checkbox');
      var exampleInputGroup = document.getElementById('example-input-group');
      var examplePhraseInput = document.getElementById('example-phrase-input');
      var addAdjectiveButton = document.getElementById('add-adjective-button');
      var addAdjectiveForm = document.getElementById('add-adjective-form');
      var adjectiveInCollectionMessage= document.getElementById('adjective-in-collection-message');
      var adjectiveSavedMessageGroup = document.getElementById('adjective-saved-message-group');

      // Bind Parsley to the example phrase input. A ParsleyField instance is returned.
      var parsleyInputField = $(examplePhraseInput).parsley();

      getAdjectiveInfoButton.addEventListener('click', function () {
        var flashSuccessMessageRow = document.getElementById('flash-success-message-row');

        if (flashSuccessMessageRow) {
          flashSuccessMessageRow.style.display = 'none';
        }

        setDisplayProperty([addAdjectiveForm, exampleInputGroup, addAdjectiveButton, adjectiveInCollectionMessage,
          adjectiveInfoContainer, adjectiveInfoHeader, adjectiveInfo, collectionPromptsRow, adjectiveSavedMessageGroup], 'none');

        addAdjectiveCheckbox.checked = false;
        getAdjectiveInfo();
      });

      addAdjectiveCheckbox.addEventListener('change', function () {
        if (addAdjectiveCheckbox.checked) {
          // Reset the Parsley UI
          parsleyInputField.reset();

          examplePhraseInput.value = '';
          exampleInputGroup.style.display = 'block';
          addAdjectiveButton.style.display = 'inline-block';
        } else {
          setDisplayProperty([exampleInputGroup, addAdjectiveButton], 'none');
        }
      });

      addAdjectiveForm.addEventListener('submit', function (e) {
        //Validate that an example phrase is entered and includes the adjective
        parsleyInputField.options.required='true';
        parsleyInputField.options.pattern = '/\\b' + adjectiveInfoHeader.textContent + '\\b/i';
        parsleyInputField.options.requiredMessage='An example phrase is required.'
        parsleyInputField.options.patternMessage='The adjective \"' + adjectiveInfoHeader.textContent + '\" must be used.'
        parsleyInputField.validate();

        if (parsleyInputField.isValid()) {
          axios.post('/add-adjective-to-user-collection', {
              wordToBeAdded: adjectiveInfoHeader.textContent,
              exampleUsage: examplePhraseInput.value
            })
            .then(function (response) {
              setDisplayProperty([addAdjectiveForm, exampleInputGroup, addAdjectiveButton], 'none');
              if (response.data === 'already in collection') {
                adjectiveInCollectionMessage.style.display = 'block';
              } else {
                adjectiveSavedMessageGroup.style.display = 'block';
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        e.preventDefault();
      });

    } else {
      getAdjectiveInfoButton.addEventListener('click', function () {
        setDisplayProperty([adjectiveInfoContainer, collectionPromptsRow, adjectiveInfoHeader, adjectiveInfo], 'none');
        getAdjectiveInfo();
      });
    }


    function getAdjectiveInfo() {
      axios.get('get-adjective-definitions', {
          params: {
            word: adjectiveInput.value.toLowerCase().trim()
          }
        })
        .then(function (response) {
          displayAdjectiveInfo(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }


    function displayAdjectiveInfo(info) {
      setDisplayProperty([adjectiveInfoContainer,collectionPromptsRow, adjectiveInfoHeader], 'block');

      if (info.adjFound) {
        adjectiveInfoHeader.textContent = info.data[0]['word'];
        adjectiveInfo.innerHTML = createDefinitionListItems(info.data);
        setDisplayProperty([adjectiveInfo, addAdjectiveForm], 'block');
      } else {
        adjectiveInfoHeader.textContent = 'No matching adjective found.';
      }
    }
  }



  /****************************************************************************/
  /***************************** Collection view ******************************/
  /****************************************************************************/
  if (document.getElementById('adjective-collection-container')) {
    var $collectionAccordian = $('#collection-accordion')

    $collectionAccordian.on('show.bs.collapse', 'div.collapse', function (evt) {
      $that = $(this);

      axios.get('get-adjective-definitions', {
          params: {
            word: $(this).prev().find('a').text().trim()
          }
        })
        .then(function (info) {
          $that.find('.collection-definition').html(createDefinitionListItems(info.data.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    });


    $collectionAccordian.on('submit', 'form', function (evt) {
      $that = $(this);

      axios.post('/remove-adjective-from-user-collection', {
          objectIdOfAdjectiveToBeDeleted: $(this).find('input').val().trim()
        })
        .then(function (info) {
          $that.closest('.panel').remove();
        })
        .catch(function (error) {
          console.log(error);
        });

      evt.preventDefault();
    });
  }


  // Used to create an HTML string containing a <li> for each of the adjective's
  // definitions.
  function createDefinitionListItems(data) {
    let listItemsHTML = '';

    data.forEach(function (result) {
      listItemsHTML += '<li>' + result.text + '</li>';
    })

    return listItemsHTML;
  }


  // Sets the display property of the elements in the array to the provided value.
  function setDisplayProperty(elements, value) {
    elements.forEach(function (element) {
      element.style.display = value;
    });
  }

})();
