  
nasfulia.account = new function () {
  var _this = this;
  var _dialogExists = false;
  this.buildAcctDialog = function () {
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
    if (this.renderAccounts()) {
      $('accountDialog').style.display = 'block';
      _dialogExists = true;
    }
  };
  this.renderAccounts = function () {
    var accts = nasfulia.user.accounts;
    var a;
    var html = '<ul>';
    // Sort by username
    accts.sort(function (a, b) {
      return a.username > b.username ? 1 : -1;
    });
    accts.each(function (v, k) {
      html += _this.accountItem(v);
    });
    html += '</ul>';
    var node = jQuery('#accountDialog').find('div.results').get(0);
    node.innerHTML = html;
    return true;
  };
  this.accountItem = function (acct) {
      return '<ul>' + acct.username + ' on ' + acct.service_id + '</ul>';
  };
  this.init = function () {
    fleegix.event.listen($('accountsDialogLink'),
      'onclick', this, 'showDialog');
    fleegix.event.listen($('newAccountButton'),
      'onclick', this, 'showForm');
    fleegix.event.listen($('save'), 'onclick',
      this, 'saveAccount');
    fleegix.event.listen($('cancel'), 'onclick',
      this, 'cancelSaveAccount');
  };
  this.showDialog = function () {
    if (!_dialogExists) {
      this.buildAcctDialog();
    }
    jQuery('#accountDialog').dialog('open');
  };
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
      var res = eval('('+ o +')');
      nasfulia.user.addAccount(res);
      _this.renderAccounts();
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
      fleegix.xhr.send({
        url: '/users/' + username + '/accounts.json',
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

