nasfulia.req = new function () {
};
nasfulia.req.Request = function () {
  var _this = this;
  fleegix.mixin(this, new fleegix.defer.Deferrable());
  this.get = function (url) {
    var success = function (obj) {
      _this.setSuccess(obj);
    };
    var err = function (obj) {
      _this.setFailure(obj);
    };
    fleegix.xhr.send({
      url: url,
      handleSuccess: success,
      handleError: err
    });
  };
};
