var nasfulia = {};

nasfulia.app = new function () {
  this.initParams = {};
  this.pageInit = null;
  this.init = function () {
    // Do global init
    //
    // Do page-specific init
    if (typeof this.pageInit == 'function') {
      this.pageInit(this.initParams);
    }
  };
};

