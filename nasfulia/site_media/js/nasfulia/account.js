  
nasfulia.account = new function () {
  var _this = this;
  var _initialized = false; 
  this.buildAcctDialog = function (){
     jQuery("#accountDialog").dialog({
        height: '24em',
        width: '36em',
        modal: false,
        buttons: { 
         "Ok": function() { 
           jQuery(this).dialog("close"); 
         }
        }
      });
  };
  
  this.init = function () {
    this.buildAcctDialog();
    fleegix.event.listen($('newAccountButton'),
      'onclick', this, 'showForm');
    fleegix.event.listen($('save'), 'onclick',
      this, 'saveAccount');
    fleegix.event.listen($('cancel'), 'onclick',
      this, 'cancelSaveAccount');
  };
  this.showDialog = function () {
    this.renderAccounts();
    jQuery('#accountDialog').dialog('open');
  };
  this.renderAccounts = function () {
    var accts = nasfulia.user.accounts;
    console.log(accts);
    var a;
    var html = '';
    accts.each(function (v, k) {
      console.log(v);
      html += '<div>' + v.username + ' on ' + v.service_id + '</div>';
    });
    var node = jQuery('#accountDialog').find('div.results').get(0);
    node.innerHTML = html;
  }
  this.showForm = function () {
    $('createFormFields').style.display = 'block';
    $('newAccountButton').style.display = 'none';
  };
  this.hideForm = function () {
    $('createFormFields').style.display = 'none';
    $('newAccountButton').style.display = 'block';
  };
  this.saveAccount = function () {
    var success = function (o) {
      console.log(o);
      _this.hideForm();
    }
    var username = fleegix.cookie.get('username');
    var data;
    var err;
    // Serialize the data
    data = fleegix.form.toObject($('createForm'));
    // Validate
    for (var d in data) {
      if (!data[d]) {
        err = true;
      }
    }
    // If err, alert the user
    if (err) {
      alert('All fields required.');
    }
    // Otherwise submit
    else {
      data = fleegix.form.serialize($('createForm'));
      console.log(data);
      fleegix.xhr.send({
        url: '/users/' + username + '/accounts',
        method: 'POST',
        data: data,
        handleSuccess: success
      });
    }
  };
  this.cancelSaveAccount = function () {
    this.hideForm();
  };
};

