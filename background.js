/* global menu:false */

let fullAccess = false;

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

  // Test if user purchased extension
  checkLicense((license) => {
    if (license && license.accessLevel !== 'FULL') {
      alert('Forbidden!!');
      return false;
    }

    chrome.tabs.getSelected((currentTab) => {
      chrome.tabs.sendMessage(currentTab.id, {
        from: 'context_menu',
        method: 'convert_text',
        params: {
          action: e,
        },
      });
    });
  })

  
});

function getLicense(cb) {
  chrome.identity.getAuthToken({ interactive: true },token => {
    
    console.log('token :', token);

    const CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
    const req = new XMLHttpRequest();
    console.log('chrome.runtime.id :', chrome.runtime.id);
    const appId = chrome.runtime.id;
    req.open('GET', CWS_LICENSE_API_URL + appId);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        const license = JSON.parse(req.responseText);
        console.log('license :', license);
        chrome.storage.sync.set({license}, function() {
          console.log('license sync');
          return cb && cb(license);
        });
      }
    }
    req.send();
  });
}

function checkLicense(cb) {
  chrome.storage.sync.get('license', function(data) {
    // console.info('data :', data);
    // console.info('data.license :', data.license);
    // console.info('Object.keys(data.license) :', Object.keys(data.license));

    const license = data.license;
    if (!license || !Object.keys(data.license).length) {
      console.log('no license');
      return getLicense(cb);
    }
    console.log(license);
    return cb && cb(license);
  });
}

// chrome.storage.sync.clear(() => {
  checkLicense();
// })
