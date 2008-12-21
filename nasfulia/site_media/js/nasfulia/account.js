
nasfulia.account = new function () {
  var _this = this;
  var _dialogExists = false;
  var _clickActions;

  var _initActions = function () {
    _clickActions ={
      'new': _this.showForm,
      'cancel': _this.hideForm,
      'save': _this.saveAccount,
      'delete': _this.deleteAccount
    };
  };

  this.init = function () {
    _initActions();
    fleegix.event.listen($('accountDialogLink'),
      'onclick', this, 'showDialog');
    var accountDialog = new fleegix.event.Delegator(
      $('accountDialog'), _clickActions, { context: _this });
  };
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
      var html = '';
      html += '<li id="accountItem_' + acct.id + '">';
      html += acct.username + ' on ' + acct.service_id;
      html += '&nbsp;'
      html += '<input type="button" class="delete" value="Delete"/>';
      html += '</li>';
      return html;
  };
  this.showDialog = function () {
    if (!_dialogExists) {
      this.buildAcctDialog();
    }
    jQuery('#accountDialog').dialog('open');
  };
  this.showForm = function () {
    $('accountFields').style.display = 'block';
    $('account_new').style.display = 'none';
  };
  this.hideForm = function () {
    $('accountFields').style.display = 'none';
    $('account_new').style.display = 'block';
  };
  this.saveAccount = function () {
    var success = function (o) {
      var res = eval('('+ o +')');
      nasfulia.user.addAccount(res);
      _this.renderAccounts();
      _this.hideForm();
    }
    var username = nasfulia.user.username;
    var data;
    var err;
    // Serialize the data
    data = fleegix.form.toObject($('account_form'));
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
      data = fleegix.form.serialize($('account_form'));
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
  this.deleteAccount = function (e) {
    var elem = fleegix.event.getSrcElementByAttribute(e, 'id');
    var id = elem.id.replace(/^accountItem_/, '');
    var success = function (o) {
      console.log(o);
    };
    var username = nasfulia.user.username;
    fleegix.xhr.send({
      url: '/users/' + username + '/accounts/' + id + '.json',
      method: 'DELETE',
      data: '',
      handleSuccess: success
    });
  }
};


