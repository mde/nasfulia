
nasfulia.user = new function () {
  // List of accounts, referenceable by id
  this.accounts = new fleegix.hash.Hash();
  this.setUpAccounts = function (arr) {
    var account;
    for (var i = 0; i < arr.length; i++) {
      account = arr[i];
      this.accounts.setItem(account.id, account);
    }
  };
};

