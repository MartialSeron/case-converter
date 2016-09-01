

String.prototype.removeAccents = function() {
    return removeDiacritics(this);
}

String.prototype.toCapitalCase = function() {
    return this.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

String.prototype.toEmailCase = function() {
    return this.removeAccents().toLowerCase().replace(/\s+/g,".");
}

String.prototype.toSentenceCase = function() {
    return this.replace(/(^\w|[.!?]\s*\w)/g, function(txt) {
        return txt.substr(0, txt.length - 1) + txt.charAt(txt.length - 1)
            .toUpperCase();
    });
};

String.prototype.toCamelCase = function(opt) { 
    
	var options = $.extend({firstLower: true}, opt);

	var str = this.removeAccents();
    // Replace special characters with a space
    str = str.replace(/[^a-zA-Z0-9 ]/g, " ");
    // put a space before an uppercase letter
    str = str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    // Lower case all characters 
    str = str.replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '').trim().toLowerCase();
    // uppercase characters preceded by a space or number and delete spaces
    str = str.replace(/([ 0-9]+)([a-zA-Z])/g, function(a,b,c) {
        return b.trim() + c.toUpperCase();
    });

    if (options.firstLower == false)
    	str = str.substr(0, 1).toUpperCase() + str.substr(1);

    return str;
}

var convertText = function(str, opt){
	if ( typeof str == 'undefined' || typeof opt == 'undefined' )
		return false;

	switch(opt) {
		case 'cc_upper':
			str = str.toUpperCase();
			break;
		case 'cc_lower':
			str = str.toLowerCase();
			break;
		case 'cc_camel':
			str = str.toCamelCase({firstLower: true}); //$.camelCase(str);
			break;
		case 'cc_pascal':
			str = str.toCamelCase({firstLower: false});
			break;
		case 'cc_capital':
			str = str.toCapitalCase();
			break;
		case 'cc_email':
			str = str.toEmailCase();
			break;
		case 'cc_wo_accent':
			str = str.removeAccents();
			break;
		case 'cc_sentence':
			str = str.toSentenceCase();
			break;
	}

	return str;
};

/**
 * To replace selected text in contentEditable DIV
 * @param  stringReplacemetTextTheReplacementValue
 */
function replaceSelectedText(replacementText) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacementText));
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacementText;
    }
}

function countWords(str){
	str = str.replace(/(^\s*)|(\s*$)/gi,"");
	str = str.replace(/[ ]{2,}/gi," ");
	str = str.replace(/\n /,"\n");
	return str.split(' ').length;
}

function countLines(str){
	console.log(str);
	str = str.replace(/(^\s*)|(\s*$)/gi,"");
	str = str.replace(/[ ]{2,}/gi," ");
	//str = str.replace(/\n /,"\n");
	return str.split('\n').length;
}

/**
 * Recieves messages from context_menu
 */
chrome.extension.onMessage.addListener(function(request, sender, opt_callback) {
  console.log('request : ', request);
  switch (request.method) {
    case 'show_informations':
      var nbWords = countWords(request.selection);
      var nbChars = request.selection.length;
      //var nbLines = countLines(request.selection);

      var msg = chrome.i18n.getMessage('lbl_words') + ' : ' + nbWords + '\n'
          + chrome.i18n.getMessage('lbl_characters') + ' : ' + nbChars + '\n'
          //+ chrome.i18n.getMessage('lbl_lines') + ' : ' + nbLines + '\n' //TODO: Find how to count HTML lines
          ;

      alert(msg);
      break;
    case 'convert_text':
      if ( $(rClickElm)[0].type == 'text' || $(rClickElm)[0].type == 'textarea')
        $(rClickElm).selection('replace', {text: convertText(request.selection, request.menu_item)});
      else if( $(rClickElm)[0].isContentEditable == true ) 
        replaceSelectedText( convertText(request.selection, request.menu_item) );
      break;
  }
    return true;
});



/**
 * Tests if clicked element is editable
 * and send a message.
 */
var rClickElm = null;
$(document).on("mousedown", function(e) {
	 var rce = e.target;
	 rClickElm = e.target;

	 var isEditableElement = ( $(rce)[0].type == 'text' || $(rce)[0].type == 'textarea' || $(rce)[0].isContentEditable == true) 
	 						? true : false;

	if ( e.which == 3 ) {
		chrome.runtime.sendMessage({
      from: 'content',
      method: 'set_cc_options_state',
      params: {
        isEditableElement: isEditableElement
      }
    });
	}
})
.on('keydown', function(e){
  console.log('Keydown triggered :', e);
  chrome.runtime.sendMessage({
    from: 'content',
    method: 'convert_text',
    params:{}
  }); 

});








