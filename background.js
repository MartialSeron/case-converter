chrome.runtime.onInstalled.addListener(function(details){

  var defaultOptions = {
    elements: [
      { name: 'upper_case', action: 'cc_upper', label_msg: 'ccm_upper_case', order: 1, key: '49' },
      { name: 'lower_case', action: 'cc_lower', label_msg: 'ccm_lower_case', order: 2, key: '50' },
      { name: 'sentence_case', action: 'cc_sentence', label_msg: 'ccm_sentence_case', order: 3, key: '51' },
      { name: 'camel_case', action: 'cc_camel', label_msg: 'ccm_camel_case', order: 4, key: '52' },
      { name: 'pascal_case', action: 'cc_pascal', label_msg: 'ccm_pascal_case', order: 5, key: '53' },
      { name: 'capital_case', action: 'cc_capital', label_msg: 'ccm_capital_case', order: 6, key: '54' },
      { name: 'email', action: 'cc_email', label_msg: 'ccm_email', order: 7, key: '55' },
      { name: 'wo_accent', action: 'cc_wo_accent', label_msg: 'ccm_wo_accent', order: 8, key: '56' },
      { name: 'informations', action: null, label_msg: 'ccm_informations', order: 9, key: '57' }
    ]
  };

  if ( details.reason == 'install' ) {
    chrome.storage.sync.set({'options': defaultOptions}, function(){
      chrome.runtime.openOptionsPage();
    });
  }
});

/**
 * Recieves messages from content
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('message : ', message);

  if ( message.method == 'set_cc_options_state') {
    menu.setCCOptionsState(message.params.isEditableElement);
  } else return;

});