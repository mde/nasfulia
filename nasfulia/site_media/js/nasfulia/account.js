  
nasfulia.account = new function () {
  var _this = this;
  
  this.buildAcctDialog = function (){
     jQuery("#acctDialog").dialog({
        height: 450,
        width: 600,
        modal:true,
        overlay: { 
          opacity: 0.5, 
          background: "black" 
        },
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
      data = fleegix.json.serialize(data);
      fleegix.xhr.send({
        url: '/users/' + username + '/accounts',
        method: 'POST',
        data: data,
        handleBoth: success
      });
    }
  };
  this.cancelSaveAccount = function () {
    this.hideForm();
  };
};
