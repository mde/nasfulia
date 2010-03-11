SERVICES = {
  'http://twitter.com/' => {
    :display => 'Twitter',
    :username_name => 'Screen Name',
    :password_name => 'Password',
    :klass => nil
  },
  'http://identi.ca/' => {
    :display => 'Identi.ca',
    :username_name => 'Nickname',
    :password_name => 'Password',
    :klass => nil
  },
  'http://jaiku.com/' => {
    :display => 'Jaiku',
    :username_name => 'Screen Name',
    :password_name => 'API Key',
    :password_url => 'http://api.jaiku.com/',
    :klass => nil
  },
  'http://pownce.com/' => {
    :display => 'Pownce',
    :username_name => 'Username',
    :password_name => 'Password',
    :klass => nil
  },
  'http://friendfeed.com/' => {
    :display => 'FriendFeed',
    :username_name => 'Nickname',
    :password_name => 'Remote Key',
    :password_url => 'https://friendfeed.com/account/api',
    :klass => nil
  }
}

module Service
  @registered_modules = {}
  def self.add_module(key, val)
    @registered_modules[key] = val
  end

  def self.get_module(key)
    @registered_modules[key]
  end

  def self.registered_modules
    @registered_modules
  end

  module ServiceBase
    def raw_get_request(hostname, port, url, username=nil, pass=nil)
      http = Net::HTTP.new(hostname, port)
      resp = nil
      http.open_timeout = 2
      http.read_timeout = 5
      begin
        http.start do |h|
          req = Net::HTTP::Get.new(url)
          if pass
            req.basic_auth username, pass
          end
          resp = h.request(req)
          if resp.code == '503'
            raise Merb::ControllerExceptions::NetworkUnavailable
          end
        end
      rescue Timeout::Error
        raise Merb::ControllerExceptions::NetworkUnavailable
      end
      resp
    end

    def raw_post_request(hostname, port, url, data, username=nil, pass=nil)
      http = Net::HTTP.new(hostname, port)
      resp = nil
      http.open_timeout = 5
      http.read_timeout = 5
      begin
        http.start do |h|
          req = Net::HTTP::Post.new(url)
          if pass
            req.basic_auth username, pass
          end
          req.set_form_data(data)
          resp = h.request(req)
          if resp.code == '503'
            raise Merb::ControllerExceptions::NetworkUnavailable
          end
        end
      rescue Timeout::Error
        raise Merb::ControllerExceptions::NetworkUnavailable
      end
      resp
    end
  end
end
