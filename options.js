var options = [];

// Saves options to chrome.storage
function save_options() {
  chrome.storage.sync.set({'options': options}, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage('options_saved');
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}



// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options(cb) {
  
  console.info('Restoring options...');
  chrome.storage.sync.get('options', function(items) {
    
    options = items.options;

    console.log('items : ', items);
    console.log('options.bindings : ', options.bindings);

    $('#list_bindings tbody').html('');

    $.each(options.elements, function(index, elem){
      var row = ''
            + '<tr>'
            + '  <td>' + (chrome.i18n.getMessage(elem.label_msg) || elem.label_msg) + '</td>'
            + '  <td>'
            + '    <div class="form-inline">'
            + '      ctrl + shift + <input type="text" data-index="' + index + '" data-order="' + elem.order + '" data-label_msg="' + elem.label_msg + '" data-name="' + elem.name + '" data-key="' + elem.key + '" value="' + String.fromCharCode(elem.key) + '" class="form-control" name="elements[' + index + ']" />'
            + '    </div>'
            + '  </td>'
            + '</tr>'
            ;

      
      
      $('#list_bindings tbody').append(row);

    });
    cb();
  });
}

function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}



function addItem() {
  var groupId   = document.getElementById('group_id').value;
  var groupName = document.getElementById('group_name').value;

  var newItem = {id: groupId, name: groupName};

  if ( groupId != '' && groupName != '') {
    groups.push(newItem);
    save_options();
    clearForm();
  }

  restore_options();
}

function removeItem(id) {
  groups.splice(id, 1);
  save_options();
  restore_options();
}

function clearForm() {
  document.getElementById('group_id').value = '';
  document.getElementById('group_name').value = '';
}



//document.addEventListener('DOMContentLoaded', restore_options);
//

(function(){

  localizeHtmlPage();
  restore_options(function(){
    console.info('Options restored.');

    var elements = $('input[name^="elements"]');

    elements.on('keydown', function(e){
      console.log('keydown triggered');
      var data = $(this).data();
      e.preventDefault();
      $(this).val('');
      
      var charCode = e.which ? e.which : 0;
      if (!charCode) return;
      var keyVals = String.fromCharCode(charCode);

      if ( keysdata.charCodes.hasOwnProperty(charCode) ) {
        keyVals = keysdata.charCodes[charCode];
      }

      $(this).val(keyVals);

      // Saving options
      // elements.each(function(i, el){
      //   var data = $(el).data();

      //   console.log('data : ', data);
      // });


      options.elements[data.index].key = charCode;
      save_options();
    });


  });

})(jQuery);