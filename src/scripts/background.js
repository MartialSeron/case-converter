/* global menu:false */
function getLicense(cb) {
  console.group('getLicense()');
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    console.log('token :', token);

    const CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
    const req = new XMLHttpRequest();
    console.log('chrome.runtime.id :', chrome.runtime.id);
    const appId = chrome.runtime.id;
    req.open('GET', CWS_LICENSE_API_URL + appId);
    req.setRequestHeader('Authorization', `Bearer ${token}`);
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        const license = JSON.parse(req.responseText);
        console.log('license :', license);

        if (!license.error) {
          chrome.storage.sync.set({ license }, () => {
            console.log('license synced');
            console.groupEnd();
            return cb && cb(license);
          });
        }
      }
    };
    req.send();
  });
}

function checkLicense(cb) {
  console.group('checkLicense()');
  chrome.storage.sync.get('license', (data) => {
    // console.info('data :', data);
    // console.info('data.license :', data.license);
    // console.info('Object.keys(data.license) :', Object.keys(data.license));

    if (!data.license || !Object.keys(data.license).length || data.license.error) {
      // console.log('no license');
      return getLicense(cb);
    }
    // console.log(data.license);
    console.groupEnd();
    return cb && cb(data.license);
  });
}

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
    chrome.management.getSelf((extInfo) => {
      console.log('extInfo : ', extInfo); // eslint-disable-line
      if (license && license.accessLevel !== 'FULL' && extInfo.installType !== 'development') {
        alert(chrome.i18n.getMessage('alert_feature_forbidden'));
      } else {
        chrome.tabs.getSelected((currentTab) => {
          chrome.tabs.sendMessage(currentTab.id, {
            from: 'context_menu',
            method: 'convert_text',
            params: { action: e },
          });
        });
      }
    });
  });
});

// chrome.storage.sync.clear(() => {
checkLicense();
// })
