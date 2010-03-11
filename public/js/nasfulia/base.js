
nasfulia.env = new function () {
  this.MOCK_MODE_LIST = false;
  this.MOCK_MODE_UPDATE = false;
  this.DEBUG = false;
};

nasfulia.app = new function () {
  var _this = this;
  this.TZ_OFFSET_MS = new Date().getTimezoneOffset() * 60 * 1000;
  this.reqId;
  this.mouseX;
  this.mouseY;
  this.handleMouseMove = function (e) {
    _this.mouseX = e.clientX;
    _this.mouseY = e.clientY;
  };
  this.init = function () {
    fleegix.event.listen(document, 'onmousemove',
      this, 'handleMouseMove');
    nasfulia.currentUser.loadAccounts();
    nasfulia.track.init();
    nasfulia.home.init();
  };
  this.noticeTypes = {
    ACCOUNT: 'account',
    TRACK: 'track'
  };
};

nasfulia.currentUser = new function () {
  this.login;
  this.accounts = [];
  this.loadAccounts = function () {
    this.accounts = this.accountsData.slice();
  };
};

nasfulia.home = new function () {
  var _form;
  var _this = this;
  var _initRequest = true;
  var _currentPostText;

  var replaceAt = function (s, url) {
    return s.replace(/@(\w+)/g, '<a href="' + url + '$1">@$1</a>');
  };
  var replaceLink = function (s) {
    return fleegix.string.addHrefLinks(s);
  };

  fleegix.event.subscribe('app', this, 'handlePub_app');

  this.pollServer = true;
  this.noticeRegistry = new fleegix.hash.Hash();
  this.submitToDialog = null;

  this.handlePub_app = function (d) {
    var data = d || {};
    if (data.fetched) {
      if (data.fetched == 'accounts') {
        nasfulia.track.getTrackNotices();
      }
    }
  };

  this.init = function () {
    _form = $('noticeUpdateForm');
    this.enableDisableSubmitButton(true);
    this.enableDisableSubmitToLink();
    this.pollingLoop();
    fleegix.event.listen(window, 'onkeyup',
      this, 'updateNoticeLength');
    fleegix.event.listen($('resortNoticeList'), 'onclick',
      this, 'sortAllByTimestamp');
    fleegix.event.listen($('noticeListContainer'), 'onclick',
      this, 'handleClick');
  };
  this.pollingLoop = function (doFetch) {
    this.getAccountNotices();
    setTimeout(function () { _this.pollingLoop.call(_this, true); },
      nasfulia.home.pollInterval*1000);
  };
  this.getAccountNotices = function () {
    nasfulia.ui.showThrobber();

    var req;
    var suffix = nasfulia.env.MOCK_MODE_LIST ? '_static' : '';
    var previous = _initRequest ? '?previous_session=true' : '';
    var url = '/notices' + suffix + '.json' + previous;
    req = new nasfulia.req.Request();
    req.addCallback(function (s) {
      var resp = eval('(' + s + ')');
      _this.handleGetNotices.call(_this, resp);
      // If this is the intial request, check to see if the
      // first set was loaded from cache and needs to be
      // immediately refreshed
      if (_initRequest) {
        _initRequest = false;
        if (nasfulia.currentUser.accounts.length) {
          var fetch = true;
          var cacheDate = new Date(resp.cached_at*1000);
          var cacheWindow = new Date(new Date().getTime() -
            (nasfulia.home.pollInterval*1000));
          // No user cache -- initial request was filled from actual
          // API call
          if (resp.successes.length) {
            fetch = false;
          }
          // Cache is new enough it doesn't need refresh yet
          if (cacheDate > cacheWindow) {
            fetch = false;
          }
          // Otherwise, get fresh records
          if (fetch) {
            _this.getAccountNotices();
            return;
          }
        }
      }
      fleegix.event.publish('app', { fetched: 'accounts' });
    });
    req.get(url);
  };
  this.handleGetNotices = function (resp) {
    var data = resp.data;
    var msg;
    var accts;
    var acct;
    var uniques = {};

    nasfulia.ui.hideThrobber();

    // Display data in list section
    if (!data.length) {
      if (_initRequest) {
        this.displayInitLoadErr();
      }
    }
    else {
      var notice;
      var dt;
      var key;
      var ul = $('noticeList');
      var li;
      if (!ul) {
        ul = $elem('ul', {id: 'noticeList'});
        $('noticeListContainer').removeChild($('loadingPrompt'));
        $('noticeListContainer').appendChild(ul);
      }
      data.reverse();
      for (var i = 0; i < data.length; i++) {
        notice = data[i];
        if (this.noticeRegistry.getItem(notice.text)) {
          if (nasfulia.env.DEBUG) {
            console.log('Duplicate');
            console.log(notice);
          }
        }
        else {
          // Default to account notices if not set
          if (typeof notice.notice_type == 'undefined') {
            notice.notice_type = nasfulia.app.noticeTypes.ACCOUNT;
          }
          // Save a reference to the item with the text as the Hash key
          // Used above to check for duplicates
          this.noticeRegistry.addItem(notice.text, notice);
          // Create timestamp for speedy sorting
          dt = this.parseISO8601(notice.created_at);
          notice.created_at_timestamp = dt.getTime();
          // Display the item
          li = this.createListItem(notice);
          ul.insertBefore(li, ul.firstChild);
          // Record number of new, unique entries for the account
          key = notice.account.username + '@' + notice.account.service_url;
          if (!uniques[key]) {
            uniques[key] = 1;
          }
          else {
            uniques[key]++;
          }
        }
      }
    }

    // Display notification
    if (!resp.successes.length && !resp.failures.length) {
      if (nasfulia.currentUser.accounts.length) {
        this.displayPreviousNoticesNotification(nasfulia.app.reqId, data.length);
      }
      else {
        this.displayNoAccountsNotification(nasfulia.app.reqId);
      }
    }
    else {
      msg = '';
      if (resp.successes.length) {
        var anyUpdates = false;
        accts = resp.successes;
        for (var i = 0; i < accts.length; i++) {
          acct = accts[i];
          key = acct.username + '@' + acct.network_id;
          if (typeof uniques[key] == 'undefined') {
            acct.unique_notice_count = 0;
          }
          else {
            anyUpdates = true;
            acct.unique_notice_count = uniques[key];
          }
        }
        if (anyUpdates) {
          msg += '<div>Got updates from:<div><ul>';
        }
        else {
          msg += '<div>No new updates from:<div><ul>';
        }
        msg += this.getAccountRows(accts);
      }
      if (resp.failures.length) {
        accts = resp.failures;
        msg += '<div>Getting updates FAILed for:<div><ul>';
        msg += this.getAccountRows(accts);
      }
      this.displayNotification(msg, nasfulia.app.reqId);
    }
    return;
  };
  this.displayInitLoadErr = function () {
    $('loadingPrompt').innerHTML = '(No updates)';
  };
  this.displayNoAccountsNotification = function (id) {
    var msg = 'No accounts enabled. Please set up or enable some accounts by clicking on the Accounts link.';
    this.displayNotification(msg, id);
  };
  this.displayPreviousNoticesNotification = function (id, len) {
    var msg = 'Loaded ' + len + ' messages from your previous session.';
    this.displayNotification(msg, id);
  };
  this.displayNotification = function (s, id) {
    var d = $elem('div', {'id': 'notification_' + id,
      'className': 'notificationBox'});
    var fadeout = function () {
      setTimeout(function () { _this.removeNotification(id); }, 5000);
    };
    d.innerHTML = s;
    d.style.visibility = 'hidden';
    $('notificationsContainer').appendChild(d);
    fleegix.fx.fadeIn(d, {duration: 1000, doAfterFinish: fadeout});
  };
  this.removeNotification = function (id) {
    var msgNode = $('notification_' + id);
    var containerNode = $('notificationsContainer');
    var remove = function () {
      containerNode.removeChild(msgNode);
    };
    fleegix.fx.fadeOut(msgNode, {duration: 1000, doAfterFinish: remove});
  };
  this.createListItem = function (notice) {
    var text;
    var dt;
    var str = '';;
    // DOM elems
    var li;
    var d;
    var img;
    var src;
    var acct = notice.account;
    var acctName;
    var username = notice.user.username;

    text = notice.text;
    text = replaceLink(text);
    text = replaceAt(text, acct.service_url);

    dt = notice.created_at;
    dt = this.parseISO8601(dt);
    dt = this.getLocalDate(dt);
    dt = this.relativeTime(dt);

    li = $elem('li');
    // Give each list item a unique id
    li.id = 'notice_' + encodeURIComponent(notice.url);
    // Profile thumb
    var mobile = fleegix.isMobile;
    var size = mobile ? 24 : 48;
    var left = mobile ? 0 : size + 10;
    var right = mobile ? 10 : 0;
    if (notice.user.url_profile_image) {
      src = notice.user.url_profile_image;
      str += '<a class="thumb" href="' + acct.service_url + username +
        '" style="height: ' + size + 'px; width: ' + size +
        'px; margin-right: ' + right + 'px;"><img src="' +
        src + '" width="' + size + '" height="' +
        size + '"/></a>';
      li.innerHTML = str;
    }
    // Notice text
    d = $elem('div', { className: 'main' });
    d.style.marginLeft = left + 'px';
    str = '';
    str += '<a class="username" href="' +
      acct.service_url + username +'">' + username + '</a> ';
    str += text;
    str += '</div>';
    d.innerHTML = str;
    li.appendChild(d);
    // Metadata
    str = '';
    d = $elem('div', { className: 'meta' });
    d.style.marginLeft = left + 'px';
    if (notice.id) {
      str += '<a href="' + notice.url + '">';
    }
    str += dt;
    if (notice.id) {
      str += '</a>';
    }
    acctName = notice.notice_type == nasfulia.app.noticeTypes.TRACK ?
      'tracking: "<span title="' + acct.username + '">' +
      nasfulia.ui.truncateTrackString(acct.username) + '</span>"' :
      'account: ' + acct.username;
    str += ' <span class="separator">|</span> ';
    str += acctName + ' on <a href="' +
      acct.service_url + '">' + acct.service_name + '</a>';
    if (notice.source && notice.source.url) {
      str += ' via <a href="' + notice.source.url +
      '">' + notice.source.name + '</a>';
    }
    str += ' <span class="separator">|</span> ';
    str += '<a href="" class="icon reply" title="Reply to this post"></a> ';
    if (notice.notice_type == nasfulia.app.noticeTypes.TRACK) {
      str += '<a href="" class="icon follow" title="Follow this user"></a> ';
    }
    else {
      // Only support add/subscribe friend in Twitter/Identica for now
      if (acct.service_url == 'http://twitter.com/' ||
        acct.service_url == 'http://identi.ca/') {
        str += '<a href="" class="icon unfollow" title="Un-follow this user"></a> ';
      }
    }
    str += '<a href="" class="icon clear" title="Clear this post from the display"></a> ';
    d.innerHTML = str;
    li.appendChild(d);

    return li;
  };
  this.enableDisableSubmitButton = function (override) {
    var btn = $('noticeUpdateButton');
    var enable = override || !!btn.disabled;
    var dis;
    var meth;
    if (enable) {
      dis = false;
      meth = 'listen';
    }
    else {
      dis = true;
      meth = 'unlisten';
    }
    btn.disabled = dis;
    fleegix.event[meth]($('noticeUpdateButton'), 'onclick',
      this, 'submitNotice');
  };
  this.showHideSubmitButton = function () {
    var btn = $('noticeUpdateButton');
    var disp = btn.style.display == 'none' ? 'block' : 'none';
    btn.style.display = disp;
  };
  this.enableDisableSubmitToLink = function () {
    var sub = $('noticeUpdateToLink');
    var cls;
    var meth;
    if (sub.className == 'toggleLink') {
      cls = 'toggleLinkDisabled';
      meth = 'unlisten';
    }
    else {
      cls = 'toggleLink';
      meth = 'listen';
    }
    sub.className = cls;
    fleegix.event[meth](sub, 'onclick', this, 'showHideSubmitTo');
  };
  this.showHideSubmitToLink = function () {
    var link = $('noticeUpdateToLink');
    var disp = link.style.display == 'none' ? 'block' : 'none';
    link.style.display = disp;
  };
  this.submitNotice = function () {
    var notice = _form.text.value || '';
    notice = fleegix.string.trim(notice);
    var f = function (o) {
      resp = eval('(' + o + ')');
      _this.handleSubmitNotice.call(_this, resp);
    };
    if (!notice.length) {
      alert('Whoops, you need to enter an update before submitting!');
    }
    else {
      _currentPostText = notice;
      this.enableDisableSubmitButton();
      this.enableDisableSubmitToLink();
      nasfulia.ui.showThrobber();
      var data = 'text=' + encodeURIComponent(notice);
      if (_form.accounts.value) {
        data += '&accounts=' + _form.accounts.value;
      }
      if (nasfulia.env.MOCK_MODE_UPDATE) {
        data += '&mock_mode=true';
      }
      nasfulia.app.reqId = fleegix.xhr.post(f, '/notices.json', data);
    }
  };
  this.handleSubmitNotice = function (resp) {
    var msg;
    var accts;
    if (!resp.successes.length && !resp.failures.length) {
      this.displayNoAccountsNotification(nasfulia.app.reqId);
    }
    else {
      if (resp.successes.length) {
        msg = '';
        accts = resp.successes;
        msg += '<div>' + 'Posted update to:<div><ul>';
        msg += this.getAccountRows(accts);
        // Yes, you might have actually pulled the posted notice
        // down in an update GET before you get to this :)
        if (!this.noticeRegistry[_currentPostText]) {
          var dt = new Date().getTime();
          dt += nasfulia.app.TZ_OFFSET_MS;
          dt = new Date(dt);
          dt = fleegix.date.util.strftime(dt, '%Y-%m-%dT%H:%M:%S');
          var n = {user: {username: nasfulia.currentUser.login},
            account: {service_name: 'Nasfulia.net', service_url: 'http://nasfulia.net'},
            text: _currentPostText,
            created_at: dt};
          this.noticeRegistry.addItem(n.text, n);
          var ul = $('noticeList');
          var li = this.createListItem(n);
          ul.insertBefore(li, ul.firstChild);
        }
      }
      if (resp.failures.length) {
        msg = '';
        accts = resp.failures;
        msg += '<div>' + 'Posting update FAILed for:<div><ul>';
        msg += this.getAccountRows(accts);
      }
      this.displayNotification(msg, nasfulia.app.reqId);
    }
    this.enableDisableSubmitButton();
    this.enableDisableSubmitToLink();
    nasfulia.ui.hideThrobber();
    _form.text.value = '';
    _form.accounts.value = '';
    this.updateNoticeLength();
    if (this.submitToDialog) {
      this.showHideSubmitTo();
    }
  };
  this.getAccountRows = function (accts) {
    var msg = '';
    var acct;
    var acctName;
    var count;
    for (var i = 0; i < accts.length; i++) {
      acct = accts[i];
      acctName = acct.notice_type == nasfulia.app.noticeTypes.TRACK ?
        'Tracking: "<span title="' + acct.username + '">' +
        nasfulia.ui.truncateTrackString(acct.username) + '</span>"' :
        'Account: ' + acct.username;
      count = acct.unique_notice_count;
      msg += '<li>' + acctName + ' <span class="separator">on</span> ' +
        acct.network_name +
        ' <span>(' + acct.network_id + ')</span>';
      if (count) {
        msg += ' -- ' + count;
        msg += count > 1 ? ' updates' : ' update';
      }
      msg += '</li>';
    }
    msg += '</ul>';
    return msg;
  };
  // Utils
  this.parseISO8601 = function (str) {
    var arr = str.split('T');
    var dt = arr[0];
    var tm = arr[1];
    arr = tm.split('.');
    tm = arr[0];
    dt = dt.split('-');
    tm = tm.split(':');
    for (var i in dt) { dt[i] = parseInt(dt[i], 10); }
    for (var i in tm) { tm[i] = parseInt(tm[i], 10); }
    return new Date(dt[0], dt[1] - 1, dt[2], tm[0], tm[1], tm[2]);
  };
  this.getLocalDate = function(dt) {
    var d = dt.getTime() - nasfulia.app.TZ_OFFSET_MS;
    return new Date(d);
  };
  this.relativeTime = function (dt) {
    var diff = (new Date().getTime() - dt.getTime()) / 1000;
    var ret;
    switch (true) {
      case diff < 60:
        ret = 'less than a minute ago';
        break;
      case diff < 120:
        ret = 'about a minute ago';
        break;
      case diff < (45*60):
        ret = parseInt((diff / 60), 10) + ' minutes ago';
        break;
      case diff < (120*60):
        ret = 'about an hour ago';
        break;
      case diff < (24*60*60):
        ret = 'about ' + parseInt((diff / 3600), 10) + ' hours ago';
        break;
      case diff < (48*60*60):
        ret = 'one day ago';
        break;
      default:
        ret = parseInt((diff / 86400), 10) + ' days ago';
        break;
    }
    return ret;
  };
  this.updateNoticeLength = function () {
    var c = $('lengthCount');
    var len = _form.text.value.length;
    c.innerHTML = (140 - len);
  };
  this.showHideSubmitTo = function () {
    this.showHideSubmitButton();
    this.showHideSubmitToLink();
    if (this.submitToDialog) {
      $('noticeUpdateForm').removeChild(this.submitToDialog);
      this.submitToDialog = null;
    }
    else {
      var submitTo = $elem('div', {id: 'submitToDialog'});
      var btnCancel = $elem('input', {type: 'button', value: 'Cancel', className: 'btn'});
      var str = '';
      var accounts = nasfulia.currentUser.accounts;
      btnCancel.onclick = function () { _this.showHideSubmitTo(); };
      var btnSubmit = $elem('input', {type: 'button', value: 'Submit To Selected', className: 'btn'});
      btnSubmit.onclick = function () { _this.submitToSelected(); };
      var d = $elem('div', {id: 'submitToDialogButtonPanel'});
      d.style.paddingTop = '4px';
      d.style.paddingBottom = '8px';
      var panel = new fleegix.ui.ButtonPanel(d, d.id, {
        buttonsLeft: [btnCancel],
        buttonsRight: [btnSubmit] });
      str += '<div id="submitToList" class="borderBox"><form id="submitToForm"';
      var acc;
      for (var i = 0; i < accounts.length; i++) {
        acc = accounts[i];
        str += '<div><label><input name="accounts" type="checkbox" value="' +
          acc.id + '"> ' +
          acc.username + ' <span style="color: #999;">on</span> ' + acc.network_name +
          '</label></div>';
      }
      str += '</form></div>';
      submitTo.innerHTML = str;
      submitTo.appendChild(panel.domNode);
      panel.render();
      $('noticeUpdateForm').appendChild(submitTo);
      this.submitToDialog = submitTo;
    }
  };
  this.submitToSelected = function () {
    var form = $('submitToForm');
    var vals = fleegix.form.serialize(form, {collapseMulti: true});
    if (vals) {
      vals = vals.split('=')[1];
      $('noticeUpdateForm').accounts.value = vals;
      this.submitNotice();
    }
    else {
      alert('You must select accounts to submit your update to.');
    }
  };
  this.sortAllByTimestamp = function (e) {
    var reg = this.noticeRegistry;
    var _this = this;
    reg.sort(function (a, b) {
      return a.created_at_timestamp < b.created_at_timestamp ?
        1 : -1;
    });
    var ul = $('noticeList');
    while (ul.hasChildNodes()) {
      ul.removeChild(ul.firstChild);
    }
    reg.each(function (notice) {
      li = _this.createListItem(notice);
      ul.appendChild(li);
    });
  };
  this.handleClick = function (e) {
    var btnType = e.target.className;
    var tar = fleegix.event.getSrcElementByAttribute(e, 'id');
    if (tar && btnType.indexOf('icon') > -1) {
      fleegix.event.annihilate(e);
      switch (btnType) {
        // Clear from display
        case 'icon clear':
          tar.parentNode.removeChild(tar);
          break;
      }
    }
  };
};

nasfulia.ui = new function () {
  this.dialog;
  this.showThrobber = function () {
    var thr = $('throbberContainer');
    thr.style.display = 'block';
  };
  this.hideThrobber = function () {
    var thr = $('throbberContainer');
    thr.style.display = 'none';
  };
  this.openModalDialog = function () {
    var div = $elem('div', { id: 'accounts' });
    var params = {
      height: 200,
      width: 200,
      content: 'Howdy'
    };
    var dialog = new fleegix.ui.DialogBox(div, div.id, params);
    document.body.appendChild(dialog.domNode);
    dialog.open();
  };
  this.truncateTrackString = function (str, len) {
    var s = str || '';
    var max = len || 14;
    if (s.length > max) {
      s = s.substr(0, (max - 4)) + ' ...';
    }
    return s;
  };
};
