
nasfulia.notice = new function () {
  this.init = function () {
    nasfulia.notice.account.fetch();
  };
};

nasfulia.notice.account = new function () {
  var _this = this;
  this.data = new fleegix.hash.Hash();

  this.fetch = function () {
    var username = nasfulia.user.username;
    var success = function (o) {
      var notices = fleegix.json.parse(o);
      var notice;
      console.log(notices);
      for (var i = 0; i < notices.length; i++) {
        notice = notices[i];
        _this.data.addItem(notice.id.toString(), notice);
      }
      _this.display();
    };
    /*
    fleegix.xhr.send({
      url: '/users/' + username + '/stream.json',
      method: 'GET',
      handleSuccess: success
    });
    */
    fleegix.xhr.send({
      url: '/site_media/twitter.json',
      method: 'GET',
      handleSuccess: success
    });
  };
  this.display = function () {
    var ul = $elem('ul');
    var li;
    var html;
    this.data.eachValue(function (val) {
      li = $elem('li');
      html = '';
      html += '<div>' + val.user.screen_name + '</div>';
      html += '<div>' + val.text + '</div>';
      li.innerHTML = html;
      ul.appendChild(li);
    });
    $('content').innerHTML = '';
    $('content').appendChild(ul);
  };
};
