(function() {
  /****************************************************************************/
  /******************************** Index view ********************************/
  /****************************************************************************/
  if (document.getElementById('adjective-search-container')) {
    const adjectiveSearchForm = document.getElementById('adjective-search-form');
    const adjectiveInput = document.getElementById('adjective-input');
    const getAdjectiveInfoButton = document.getElementById('get-adjective-info-button');
    const adjectiveInfoContainer = document.getElementById('adjective-info-container');
    const collectionPromptsRow = document.getElementById('collection-prompts-row');
    const adjectiveInfoHeading = document.getElementById('adjective-info-heading');
    const sourceDictionary = document.getElementById('source-dictionary');
    const adjectiveInfo = document.getElementById('adjective-info');

    adjectiveSearchForm.addEventListener('submit', evt => {
      evt.preventDefault();
    });

    // Check if LOGGED IN index view
    if (document.getElementById('logged-in-group')) {
      const addAdjectiveCheckbox = document.getElementById('add-adjective-checkbox');
      const exampleInputGroup = document.getElementById('example-input-group');
      const examplePhraseInput = document.getElementById('example-phrase-input');
      const addAdjectiveButton = document.getElementById('add-adjective-button');
      // addAdjectiveForm is declared with  var  because it needs to be in scope outside of the "if block" to prevent a ReferenceError
      var addAdjectiveForm = document.getElementById('add-adjective-form');
      const adjectiveInCollectionMessage= document.getElementById('adjective-in-collection-message');
      const adjectiveSavedMessageGroup = document.getElementById('adjective-saved-message-group');

      // Bind Parsley to the example phrase input. A ParsleyField instance is returned.
      const parsleyInputField = $(examplePhraseInput).parsley();

      getAdjectiveInfoButton.addEventListener('click', function () {
        const flashSuccessMessageRow = document.getElementById('flash-success-message-row');

        if (flashSuccessMessageRow) {
          flashSuccessMessageRow.style.display = 'none';
        }

        setDisplayProperty([addAdjectiveForm, exampleInputGroup, addAdjectiveButton, adjectiveInCollectionMessage,
          adjectiveInfoContainer, adjectiveInfoHeading, sourceDictionary, adjectiveInfo, collectionPromptsRow,
          adjectiveSavedMessageGroup], 'none');

        addAdjectiveCheckbox.checked = false;
        getAdjectiveInfo();
      });

      addAdjectiveCheckbox.addEventListener('change', () => {
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

      addAdjectiveForm.addEventListener('submit', e => {
        //Validate that an example phrase is entered and includes the adjective
        parsleyInputField.options.required='true';
        parsleyInputField.options.pattern = `/\\b${adjectiveInfoHeading.textContent}\\b/i`;
        parsleyInputField.options.requiredMessage='An example phrase is required.';
        parsleyInputField.options.patternMessage=`The adjective "${adjectiveInfoHeading.textContent}" must be used.`;
        parsleyInputField.validate();

        if (parsleyInputField.isValid()) {
          axios.post('/add-adjective-to-user-collection', {
              wordToBeAdded: adjectiveInfoHeading.textContent,
              exampleUsage: examplePhraseInput.value
            })
            .then(response => {
              setDisplayProperty([addAdjectiveForm, exampleInputGroup, addAdjectiveButton], 'none');
              if (response.data === 'already in collection') {
                adjectiveInCollectionMessage.style.display = 'block';
              } else {
                adjectiveSavedMessageGroup.style.display = 'block';
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
        e.preventDefault();
      });

    } else {
      getAdjectiveInfoButton.addEventListener('click', () => {
        setDisplayProperty([adjectiveInfoContainer, collectionPromptsRow, adjectiveInfoHeading, sourceDictionary, adjectiveInfo], 'none');
        getAdjectiveInfo();
      });
    }


    function getAdjectiveInfo() {
      axios.get('get-adjective-definitions', {
          params: {
            word: adjectiveInput.value.toLowerCase().trim()
          }
        })
        .then(response => {
          displayAdjectiveInfo(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }


    function displayAdjectiveInfo(info) {
      setDisplayProperty([adjectiveInfoContainer, collectionPromptsRow, adjectiveInfoHeading], 'block');

      if (info.adjFound) {
        adjectiveInfoHeading.textContent = info.data[0].word;
        sourceDictionary.textContent = info.data[0].attributionText;
        adjectiveInfo.innerHTML = createDefinitionListItems(info.data);
        setDisplayProperty([sourceDictionary, adjectiveInfo, addAdjectiveForm], 'block');
      } else {
        adjectiveInfoHeading.textContent = 'No matching adjective found.';
      }
    }
  }



  /****************************************************************************/
  /***************************** Collection view ******************************/
  /****************************************************************************/
  if (document.getElementById('adjective-collection-container')) {
    const $collectionAccordian = $('#collection-accordion');

    $collectionAccordian.on('show.bs.collapse', 'div.collapse', function(evt) {
      axios.get('get-adjective-definitions', {
          params: {
            word: $(this).prev().find('a').text().trim()
          }
        })
        .then(info => {
          $(this).find('.collection-source').text(info.data.data[0].attributionText);
          $(this).find('.collection-definitions').html(createDefinitionListItems(info.data.data));
        })
        .catch(error => {
          console.log(error);
        });
    });


    $collectionAccordian.on('submit', 'form', function(evt) {
      axios.post('/remove-adjective-from-user-collection', {
          objectIdOfAdjectiveToBeDeleted: $(this).find('input').val().trim()
        })
        .then(info => {
          $(this).closest('.panel').remove();
        })
        .catch(error => {
          console.log(error);
        });

      evt.preventDefault();
    });
  }


  // Used to create an HTML string containing a <li> for each of the adjective's
  // definitions.
  function createDefinitionListItems(data) {
    // Only include definitions found in the first source dictionary
    const filteredData = data.filter(definition => definition.sourceDictionary === data[0].sourceDictionary);
    
    let listItemsHTML = '';

    filteredData.forEach(result => {
      if (result.text !== undefined) {
        //Remove synonym-related text at end of string
        const textWithoutSynonym = result.text.replace(/\s*<i>.*<\/strong>\.?$/, '');

        listItemsHTML += `<li>${textWithoutSynonym}</li>`;
      }
    })

    return listItemsHTML;
  }


  // Sets the display property of the elements in the array to the provided value.
  function setDisplayProperty(elements, value) {
    elements.forEach(element => {
      if (element !== undefined) {
        element.style.display = value;
      }
    });
  }

})();
