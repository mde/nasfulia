module Service
  module Jaiku
    include ServiceBase

    CONFIG = {
      :id => 'http://jaiku.com/',
      :hostname => 'jaiku.com',
      :port => 80,
      :display => 'Jaiku',
      :username_name => 'Screen Name',
      :password_name => 'API Key',
      :password_url => 'http://api.jaiku.com/',
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
      url = '/contacts/feed/json?user=' + username + '&personal_key=' + password
      resp = raw_get_request(username + '.' + CONFIG[:hostname], CONFIG[:port], url)
      if resp.body
        items = JSON.parse(resp.body)
        items = items['stream']
        data = []
        items.each do |i|
          id = i['id'].to_s
          data.push({:user => {:name => i['user']['first_name'] + ' ' + i['user']['last_name'],
            :username => i['user']['nick'],
            :url_profile_image => i['user']['avatar']
            },
            :text => i['title'],
            :id => id,
            :url => i['url'],
            :created_at => i['created_at'],
            :account => {:service_name => 'Jaiku',
              :service_url => 'http://jaiku.com/',
              :username => username}
          })
        end
        data
      end
    end

    def post_new(d)
      http = Net::HTTP.new('api.' + CONFIG[:hostname], CONFIG[:port])
      url = '/json'
      resp = nil
      http.open_timeout = 2
      http.read_timeout = 2
      begin
        http.start do |h|
          req = Net::HTTP::Post.new(url)
          req.set_form_data({'user' => username, 'personal_key' => password,
            'method' => 'presence.send', 'message' => d})
          resp = h.request(req)
          if resp.code == '503'
            raise Merb::ControllerExceptions::NetworkUnavailable
          end
        end
      rescue Timeout::Error
        raise Merb::ControllerExceptions::NetworkUnavailable
      end
      resp.body
    end
  end
end

