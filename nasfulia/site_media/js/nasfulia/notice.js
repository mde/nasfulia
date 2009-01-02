
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
      li = $elem('li', { className: 'notice' });
      html = '';
      //html += '<div><img src="' + val.user.profile_image_url + '" alt=""/></div>';
      html += '<a class="thumb" href="">';
      html += '<img src="' + val.user.profile_image_url + '" alt=""/>';
      html += '</a>';
      html += '<a href="">' + val.user.screen_name + '</a> ';
      html += val.text;
      li.innerHTML = html;
      ul.appendChild(li);
    });
    $('notices').innerHTML = '';
    $('notices').appendChild(ul);
  };
};
