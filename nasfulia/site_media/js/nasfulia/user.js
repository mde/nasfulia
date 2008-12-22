
nasfulia.user = new function () {
  this.username = fleegix.cookie.get('username');
  // List of accounts, referenceable by id
  this.accounts = new fleegix.hash.Hash();
  this.setUpAccounts = function (arr) {
    var a;
    for (var i = 0; i < arr.length; i++) {
      this.addAccount(arr[i]);
    }
  };
  this.addAccount = function (a) {
    this.accounts.addItem(a.id.toString(), a);
  };
  this.removeAccount = function (a) {
    this.accounts.removeItem(a.id.toString(), a);
  };
};

