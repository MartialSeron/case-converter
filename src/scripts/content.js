/* global removeDiacritics:false, $:false */

const StringUtils = {
  removeAccents(str) {
    console.log('removeAccents str :', str);
    return removeDiacritics(str);
  },
  toCapitalCase(str) {
    return str.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase());
  },
  toEmailCase(str) {
    return this.removeAccents(str).toLowerCase().replace(/\s+/g, '.');
  },
  toSentenceCase(str) {
    return str.replace(/(^\w|[.!?]\s*\w)/g, txt => txt.substr(0, txt.length - 1) + txt.charAt(txt.length - 1).toUpperCase());
  },
  toCamelCase(str, { firstLower = true }) {
    this.removeAccents(str)
    // Replace special characters with a space
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    // put a space before an uppercase letter
    .replace(/([a-z](?=[A-Z]))/g, '$1 ')
    // Lower case all characters
    .replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '')
    .trim()
    .toLowerCase()
    // uppercase characters preceded by a space or number and delete spaces
    .replace(/([ 0-9]+)([a-zA-Z])/g, (a, b, c) => b.trim() + c.toUpperCase());

    if (firstLower === false) {
      return str.substr(0, 1).toUpperCase() + str.substr(1);
    }
    return str;
  },
  countWords(str) {
    if (!str.replace) return str;
    str.replace(/(^\s*)|(\s*$)/gi, '')
    .replace(/[ ]{2,}/gi, ' ')
    .replace(/\n /, '\n');
    return str.split(' ').length;
  },
  countLines(str) {
    if (!str.replace) return str;
    str.replace(/(^\s*)|(\s*$)/gi, '')
    .replace(/[ ]{2,}/gi, ' ');
    return str.split('\n').length;
  },
};

class Replacement {
  constructor() {
    this.element = '';
  }
  setStrategy(element) {
    this.element = element;
  }
  replaceSelectedText(replacementText) {
    this.element.replaceSelectedText(replacementText);
  }
  getSelectedText() {
    return this.element.getSelectedText();
  }
}

class ContentEditableElement {
  constructor(element, context) {
    this.context = context;
    this.element = element;
  }

  /**
   * To replace selected text in contentEditable element
   * @param  string ReplacemetText The Replacement Value
   */
  replaceSelectedText(replacementText) {
    let sel;
    let range;
    if (this.context.getSelection) {
      sel = this.context.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(this.context.document.createTextNode(replacementText));
      }
    } else if (this.context.document.selection && this.context.document.selection.createRange) {
      range = this.context.document.selection.createRange();
      range.text = replacementText;
    }
  }

  getSelectedText() {
    return this.context.getSelection().toString();
  }
}

class InputElement {
  constructor(element, context) {
    this.context = context;
    this.element = element;
  }

  replaceSelectedText(replacementText) {
    const sel = this.getSelectedRange();
    const val = this.element.value;
    this.element.value = val.slice(0, sel.start)
                       + replacementText
                       + val.slice(sel.end);
    this.selectText(sel.start, sel.end);
  }

  selectText(startIndex, endIndex) {
    this.element.focus();
    this.element.selectionStart = startIndex;
    this.element.selectionEnd = endIndex;
  }

  getSelectedText() {
    return this.element.value.slice(this.element.selectionStart, this.element.selectionEnd);
  }

  getSelectedRange() {
    let start = 0;
    let end = 0;
    let normalizedValue;
    let range;
    let textInputRange;
    let len;
    let endRange;

    if (typeof this.element.selectionStart === 'number' && typeof this.element.selectionEnd === 'number') {
      start = this.element.selectionStart;
      end = this.element.selectionEnd;
    } else {
      range = this.context.document.selection.createRange();

      if (range && range.parentElement() === this.element) {
        len = this.element.value.length;
        normalizedValue = this.element.value.replace(/\r\n/g, '\n');

        // Create a working TextRange that lives only in the input
        textInputRange = this.element.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        // Check if the start and end of the selection are at the very end
        // of the input, since moveStart/moveEnd doesn't return what we want
        // in those cases
        endRange = this.element.createTextRange();
        endRange.collapse(false);

        if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
          start = len;
          end = len;
        } else {
          start = -textInputRange.moveStart('character', -len);
          start += normalizedValue.slice(0, start).split('\n').length - 1;

          if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
            end = len;
          } else {
            end = -textInputRange.moveEnd('character', -len);
            end += normalizedValue.slice(0, end).split('\n').length - 1;
          }
        }
      }
    }

    return {
      start,
      end,
    };
  }
}

/**
 * Return true if elmement can contains text selectable
 * @param {HTMLElement} el Element to test
 */
const isSelectable = (el) => {
  const elTagName = el ? el.tagName.toLowerCase() : null;
  if ((elTagName === 'textarea' ||
      (elTagName === 'input' && /^(?:text|search|password|tel|url)$/i.test(el.type)))
      && (typeof el.selectionStart === 'number')) {
    return true;
  }
  return false;
};

/**
 * Return true if elmement has option `isContentEditable`
 * @param {HTMLElement} el Element to test
 */
const isContentEditable = el => el && el.isContentEditable;

/**
 * Convert string according to option
 * @param {string} str The string to convert
 * @param {string} opt The option used to convert the string
 */
const convertText = (str, opt) => {
  
    console.log('str :', str);
    console.log('opt :', opt);
  if (!str || !opt) {
    return '';
  }

  if (opt === 'cc_upper') return str.toUpperCase();
  if (opt === 'cc_lower') return str.toLowerCase();
  if (opt === 'cc_camel') return StringUtils.toCamelCase(str, { firstLower: true });
  if (opt === 'cc_pascal') return StringUtils.toCamelCase(str, { firstLower: false });
  if (opt === 'cc_capital') return StringUtils.toCapitalCase(str);
  if (opt === 'cc_email') return StringUtils.toEmailCase(str);
  if (opt === 'cc_wo_accent') return StringUtils.removeAccents(str);
  if (opt === 'cc_sentence') return StringUtils.toSentenceCase(str);
  return str;
};

/**
 * Recieves messages from background or context_menu
 */
chrome.extension.onMessage.addListener((request) => {

  console.log('request.method :', request.method);

  if (request.method === 'show_informations') {
    console.log('request.params.selection :', request.params.selection);
    const nbWords = StringUtils.countWords(request.params.selection);
    const nbChars = request.params.selection.length;
    const msg = `${chrome.i18n.getMessage('lbl_words')} : ${nbWords}\n${chrome.i18n.getMessage('lbl_characters')} : ${nbChars}`;
    alert(msg); // eslint-disable-line
  }

  if (request.method === 'convert_text') {
    const activeEl = document.activeElement;
    const repl = new Replacement();
    let el;

    if (isSelectable(activeEl)) {
      el = new InputElement(activeEl, window);
    } else if (isContentEditable(activeEl)) {
      el = new ContentEditableElement(activeEl, window);
    } else {
      return false;
    }

    repl.setStrategy(el);
    const selection = repl.getSelectedText();
    console.log('selection :', selection);
    const convtxt = convertText(selection, request.params.action);
    repl.replaceSelectedText(convtxt);
  }
  return true;
});

/**
 * Tests if clicked element is editable and send a message to activate context menu
 */
document.addEventListener('mousedown', (e) => {
  const isEditableElement = isSelectable(e.target) || isContentEditable(e.target);
  if (parseInt(e.which, 10) === 3) {
    chrome.runtime.sendMessage({
      from: 'content',
      method: 'set_cc_options_state',
      params: { isEditableElement },
    });
  }
});


