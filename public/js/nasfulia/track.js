
nasfulia.track = new function () {
  var _this = this;
  var _incr = 0;
  var _script;
  var _head;

  this.trackList = [];
  this.currentTracks = [];
  this.currentTracker;
  this.noticeRegistry;
  this.results;
  this.refreshUrls = {};
  this.init = function () {
    _head = window.document.getElementsByTagName("head")[0] ||
      window.document.documentElement;
    var tracks = nasfulia.currentUser.tracks;
    for (var i = 0; i < tracks.length; i++) {
      this.trackList.push(tracks[i].text);
    }
  };
  this.appendScriptTag = function (src) {
    _script = window.document.createElement('script');
    _script.type = 'text/javascript';
    _script.src = src;
    _head.appendChild(_script);
    return true;
  };
  this.handleFetch = function (o) {
    if (navigator.userAgent.indexOf('Opera Mini') == -1) {
      _head.removeChild(_script);
    }
    if (_this.currentTracker) {
      tracker = _this.currentTracker;
      _this.refreshUrls[tracker.terms] = o.refresh_url;
      tracker.handleFetch(o);
    }
    else {
      throw new Error('No current tracker to handle fetched records.');
    }
  };
  this.getTrackNotices = function () {
    if (this.trackList.length) {
      _incr++;
      this.noticeRegistry = new fleegix.hash.Hash();
      this.results = {successes: [], failures: []};
      this.currentTracks = this.trackList.slice();
      nasfulia.ui.showThrobber();
      this.getNextTrackNotices();
    }
  };
  this.getNextTrackNotices = function () {
    // Get next track results
    if (this.currentTracks.length) {
      var tr = this.currentTracks.shift();
      var tr = new nasfulia.track.Twitter(tr);
      this.currentTracker = tr;
      tr.fetch();
    }
    // Display all of them
    else {
      var items = [];
      this.noticeRegistry.sort(function (a, b) {
        return a.created_at_timestamp < b.created_at_timestamp ?
          1 : -1;
      });
      this.noticeRegistry.each(function (item) {
        items.push(item);
      });
      this.results.data = items;
      nasfulia.app.reqId = 'trackList' + _incr;
      nasfulia.home.handleGetNotices(this.results);
    }
  };
  this.appendNotices = function (data) {
    var count = 0;
    for (var i = 0; i < data.length; i++) {
      notice = data[i];
      if (this.noticeRegistry.getItem(notice.text)) {
        if (nasfulia.env.DEBUG) {
          console.log('Duplicate');
          console.log(notice);
        }
      }
      else {
        // Save a reference to the item with the text as the Hash key
        // Used above to check for duplicates
        this.noticeRegistry.addItem(notice.text, notice);
        count++;
      }
    }
    this.results.successes.push({
      network_name: 'Twitter',
      network_id: 'http://twitter.com/',
      username: this.currentTracker.terms,
      notice_count: count,
      notice_type: nasfulia.app.noticeTypes.TRACK
    });
    this.getNextTrackNotices();
  };
};

function handleFetch(o) {
  nasfulia.track.handleFetch(o);
}

nasfulia.track.Tracker = function (terms) {
  this.terms = terms;
  this.url;
  this.fetch = function () {};
  this.handleFetch = function () {};
  this.convert = function () {};
};

nasfulia.track.Twitter = fleegix.extend(
  nasfulia.track.Tracker, function (terms) {
  this.url = 'http://search.twitter.com/search?q=' +
    encodeURIComponent(this.terms) + '&refresh=true&callback=handleFetch';
  this.fetch = function () {
    var query = nasfulia.track.refreshUrls[this.terms];
    if (query) {
      url = fleegix.uri.getBase(this.url) + query + '&refresh=true&callback=handleFetch';
    }
    else {
      url = this.url;
    }
    nasfulia.track.appendScriptTag(url);
  };
  this.handleFetch = function (o) {
    var results = o.results;
    var res;
    var items = [];
    var item;
    var dt;
    var timestamp;
    for (var i = 0; i < results.length; i++) {
      res = results[i];
      item = {};
      dt = res.created_at;
      dt = new Date(dt);
      item.created_at_timestamp = dt;
      dt = dt.getTime() + nasfulia.app.TZ_OFFSET_MS;
      dt = new Date(dt);
      dt = fleegix.date.util.strftime(dt, '%Y-%m-%dT%H:%M:%S');
      item.user = { username: res.from_user,
        url_profile_image: res.profile_image_url
      };
      item.text = res.text;
      item.id = '' + res.id;
      item.url = 'http://twitter.com/' + res.from_user +
        '/statuses/' + res.id;
      item.created_at = dt;
      item.account = { service_name: 'Twitter',
        service_url: 'http://twitter.com/',
        username: this.terms
      };
      item.notice_type = nasfulia.app.noticeTypes.TRACK
      items.push(item);
    }
    nasfulia.track.appendNotices(items);
  };
});
