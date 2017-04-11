/* global menu:false */

/**
 * Recieves messages from content
 */
chrome.runtime.onMessage.addListener((message) => {
  console.log('message : ', message); // eslint-disable-line
  if (message.method === 'set_cc_options_state') {
    menu.setCCOptionsState(message.params.isEditableElement);
  }
});


chrome.commands.onCommand.addListener((e) => {
  chrome.tabs.getSelected((currentTab) => {
    chrome.tabs.sendMessage(currentTab.id, {
      from: 'context_menu',
      method: 'convert_text',
      params: {
        action: e,
      },
    });
  });
});
