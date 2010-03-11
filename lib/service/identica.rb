module Service
  module Identica
    include ServiceBase

    CONFIG = {
      :id => 'http://identi.ca/',
      :hostname => 'identi.ca',
      :port => 80,
      :display => 'Identi.ca',
      :username_name => 'Nickname',
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
      url = '/api/statuses/friends_timeline.json'
      resp = raw_get_request(CONFIG[:hostname], CONFIG[:port],
        url, username, password)
      if resp.body
        items = JSON.parse(resp.body)
        data = []
        items.each do |i|
          id = i['id'].to_s
          u = i['user']['screen_name']
          data.push({:user => {:name => i['user']['name'],
            :username => u,
            :url_profile_image => 'http://identi.ca/' + u + '/avatar/48',
            :location => i['user']['location']
            },
            :text => i['text'],
            :id => id,
            :url => 'http://identi.ca/notice/' + id,
            # Convert from Twitter's fucked-up date format to ISO8601
            :created_at => DateTime.parse(i['created_at']).strftime('%Y-%m-%dT%H:%M:%S%z'),
            :account => {:service_name => 'Identica',
              :service_url => 'http://identi.ca/',
              :username => username}
          })
        end
        data
      end
    end

    def post_new(d)
      url = '/api/statuses/update.json'
      post_data = {'status' => d}
      resp = raw_post_request(CONFIG[:hostname], CONFIG[:port],
        url, post_data, username, password)
      data = nil
      if resp.body
        data = JSON.parse(resp.body)
      end
    end
  end
end


