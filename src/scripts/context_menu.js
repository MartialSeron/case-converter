

/**
 * Namespace for context menu functionality.
 */
const menu = {

  /**
   * Adds a context menu to every page that lets the user select text and add
   * an event to calendar.
   * @private
   */
  installContextMenu() {
    menu.contextMenu = chrome.contextMenus.create({
      title: chrome.i18n.getMessage('case_converter_extension_name'),
      contexts: ['selection'],
      id: 'caseconverter',
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_upper_case'),
      contexts: ['selection'],
      id: 'cc_upper',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_lower_case'),
      contexts: ['selection'],
      id: 'cc_lower',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_sentence_case'),
      contexts: ['selection'],
      id: 'cc_sentence',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_camel_case'),
      contexts: ['selection'],
      id: 'cc_camel',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_pascal_case'),
      contexts: ['selection'],
      id: 'cc_pascal',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_capital_case'),
      contexts: ['selection'],
      id: 'cc_capital',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });


    /* Not case converter options */
    chrome.contextMenus.create({
      type: 'separator',
      contexts: ['selection'],
      id: 'cc_sep1',
      parentId: 'caseconverter',
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_email'),
      contexts: ['selection'],
      id: 'cc_email',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_wo_accent'),
      contexts: ['selection'],
      id: 'cc_wo_accent',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });

  /* Informations */
    chrome.contextMenus.create({
      type: 'separator',
      contexts: ['selection'],
      id: 'cc_sep2',
      parentId: 'caseconverter',
    });

    chrome.contextMenus.create({
      title: chrome.i18n.getMessage('ccm_informations'),
      contexts: ['selection'],
      id: 'cc_informations',
      parentId: 'caseconverter',
      onclick: menu.onClicked,
    });
  },


  /**
   * The click handler that gets called when a user selects text, then clicks
   * on our context menu.
   * @param {OnClickData} info The highlighted text, URL, etc.
   * @param {Tab} tab The current tab.
   * @private
   */
  onClicked(info, tab) {
    if (info.menuItemId === 'cc_informations') {
      chrome.tabs.sendMessage(tab.id, {
        from: 'context_menu',
        method: 'show_informations',
        params: {
          selection: info.selectionText,
        },
      });
    } else if (info.editable) {
      chrome.tabs.sendMessage(tab.id, {
        from: 'context_menu',
        method: 'convert_text',
        params: {
          selection: info.selectionText,
          action: info.menuItemId,
        },
      });
    } else {
      alert(chrome.i18n.getMessage('msg_not_editable_element')); // eslint-disable-line
    }
  },

  /**
   * Initializes the context menu functionality.
   */
  initialize() {
    menu.installContextMenu();
    menu.setCCOptionsState();
  },


  /**
   * Disables the menu's entries if state is false
   * @param {Boolean} state Disable entries if false
   */
  setCCOptionsState(state) {
    const s = (typeof state === 'undefined') ? true : state;
    chrome.contextMenus.update('cc_upper', { enabled: s });
    chrome.contextMenus.update('cc_lower', { enabled: s });
    chrome.contextMenus.update('cc_capital', { enabled: s });
    chrome.contextMenus.update('cc_sentence', { enabled: s });
    chrome.contextMenus.update('cc_camel', { enabled: s });
    chrome.contextMenus.update('cc_pascal', { enabled: s });
    chrome.contextMenus.update('cc_email', { enabled: s });
    chrome.contextMenus.update('cc_wo_accent', { enabled: s });
  },
};

/* Initialise context menu */
menu.initialize();

