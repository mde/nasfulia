class Application < Merb::Controller
  before :throttle_polling
  def throttle_polling
    if current_user != :false and params[:format]
      key = "access_times:#{ current_user.login }"
      access_times = CACHE.get(key) || []
      now = Time.now.to_i
      one_hour_ago = now - 3600
      access_times.delete_if do |t|
        t < one_hour_ago
      end
      # Over
      if access_times.length > 200
        raise "Over API limit for Nasfulia.net."
      # Not over the limit
      else
        access_times.push(now)
      end
      CACHE.set(key, access_times)
    end
  end
  
  def display(object, thing = nil, opts = {})
    # Append the callback param for JS data requests
    # and render as application/javascript
    if params[:format] == 'js'
      callback = params['callback']
      data = object.to_json
      data = callback + '(' + data + ');' if callback
      render data, :content_type => 'application/javascript'
    # Otherwise hand it off to the built-ins
    else
      # DM collections respond to to_json but not to to_xml
      # round-trip through JSON and back to Array/Hash
      object = JSON.parse(object.to_json)
      super
    end
  end
end
