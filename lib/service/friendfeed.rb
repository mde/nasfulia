module Service
  module FriendFeed
    include ServiceBase

    CONFIG = {
      :id => 'http://friendfeed.com/',
      :hostname => 'friendfeed.com',
      :port => 80,
      :display => 'FriendFeed',
      :username_name => 'Nickname',
      :password_name => 'Remote Key',
      :password_url => 'https://friendfeed.com/account/api',
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
      url = '/api/feed/home?format=json'
      resp = raw_get_request(CONFIG[:hostname], CONFIG[:port],
        url, username, password)
      if resp.body
        items = JSON.parse(resp.body)
        items = items['entries']
        data = []
        items.each do |i|
          id = i['id'].to_s
          source_name = i['service']['name'] == 'FriendFeed' ?
            'Direct to FriendFeed' : i['service']['name'] + ' via FriendFeed'
          data.push({:user => {:name => i['user']['name'],
            :username => i['user']['nickname'],
            :url_profile_image => i['service']['iconUrl']
            },
            :text => i['title'],
            :id => id,
            :url => id['link'],
            :created_at => i['published'],
            :account => {:service_name => 'FriendFeed',
              :service_url => 'http://friendfeed.com/',
              :username => username},
            :source => {:name => source_name,
              :url => 'http://friendfeed.com/'}
          })
        end
        data
      end
    end
    
    def post_new(d)
      url = '/api/share'
      post_data = {'title' => d}
      resp = raw_post_request(CONFIG[:hostname], CONFIG[:port],
        url, post_data, username, password)
      data = nil
      if resp.body
        data = JSON.parse(resp.body)
      end
    end
  end
end


