#include Powncer
module Service
  module Pownce
    include ServiceBase

    CONFIG = {
      :id => 'http://pownce.com/',
      :hostname => 'api.pownce.com',
      :port => 80,
      :display => 'Pownce',
      :app_key => 'fcainjl6953o2rheg84008ukt8g521j2',
      :username_name => 'Username',
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
      url = '/2.0/note_lists/' + username + '.json?app_key=' + CONFIG[:app_key]
      resp = raw_get_request(CONFIG[:hostname], CONFIG[:port],
        url, username, password)
      if resp.body
        items = JSON.parse(resp.body)
        items = items['notes']
        data = []
        items.each do |i|
          source_name = i['app']['display_name'] || i['app']['name']
          data.push({:user => {:name => i['sender']['short_name'],
            :username => i['sender']['username'],
            :url_profile_image => i['sender']['profile_photo_urls']['medium_photo_url']
            },
            :text => i['body'],
            :id => i['id'].to_s,
            :url => i['permalink'],
            # Convert from GMT timestamp
            :created_at => Time.at(i['timestamp']).gmtime.strftime('%Y-%m-%dT%H:%M:%S%z'),
            :account => {:service_name => 'Pownce',
              :service_url => 'http://pownce.com/',
              :username => username},
            :source => {:name => source_name,
              :url => i['app']['url']}
          })
        end
        data
      end
    end

    def post_new(d)
      url = '/2.0/send/message.json?app_key=' + CONFIG[:app_key]
      post_data = {'note_to' => 'all', 'note_body' => d}
      resp = raw_post_request(CONFIG[:hostname], CONFIG[:port],
        url, post_data, username, password)
      data = nil
      if resp.body
        data = JSON.parse(resp.body)
      end
      data
    end
  end
end

