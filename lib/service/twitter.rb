module Service
  module Twitter
    include ServiceBase

    CONFIG = {
      :id => 'http://twitter.com/',
      :hostname => 'twitter.com',
      :port => 80,
      :display => 'Twitter',
      :username_name => 'Screen Name',
      :password_name => 'Password',
      :mod => self
    }

    Service::add_module(CONFIG[:id], self)

    def self.config
      CONFIG
    end

    def config
      CONFIG
    end

    def get_list
      url = '/statuses/friends_timeline.json'
      resp = raw_get_request(CONFIG[:hostname], CONFIG[:port],
        url, username, password)
      if resp.body
        # Filter out retarded missing status message that
        # isn't JSON and breaks the parser
        body = resp.body.gsub(/,Couldn't find Status with ID=\d*,/, ',')
        items = JSON.parse(body)
        data = []
        items.each do |i|
          id = i['id'].to_s
          source_arr = i['source'].sub('<a href="', '').sub('</a>', '').split('">')
          source_url = source_arr[0] == 'web' ? nil : source_arr[0]
          source_name = source_url.nil? ? 'Web' : source_arr[1]
          data.push({:user => {:name => i['user']['name'],
            :username => i['user']['screen_name'],
            :url_profile_image => i['user']['profile_image_url'],
            :location => i['user']['location']
            },
            :text => i['text'],
            :id => id,
            :url => 'http://twitter.com/' + i['user']['screen_name'] +
              '/statuses/' + id,
            # Convert from Twitter's fucked-up date format to ISO8601
            :created_at => DateTime.parse(i['created_at']).strftime('%Y-%m-%dT%H:%M:%S%z'),
            :account => {:service_name => 'Twitter',
              :service_url => 'http://twitter.com/',
              :username => username},
            :source => {:name => source_name,
              :url => source_url}
          })
        end
        data
      end
    end

    def post_new(d)
      url = '/statuses/update.json'
      post_data = {'status' => d}
      resp = raw_post_request(CONFIG[:hostname], CONFIG[:port],
        url, post_data, username, password)
      data = nil
      if resp.body
        puts resp.body
        data = JSON.parse(resp.body)
      end
    end
  end
end

