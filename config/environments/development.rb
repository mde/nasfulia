memcache_hosts = ['127.0.0.1:11211']
CACHE = MemCache.new(memcache_hosts, { :namespace => 'nasfulia' })

Merb.logger.info("Loaded DEVELOPMENT Environment...")
Merb::Config.use { |c|
  c[:exception_details] = true
  c[:reload_classes] = true
  c[:reload_time] = 0.5
  c[:log_auto_flush ] = true
  c[:session_store] = 'memcache'
}

# App host -- mail controller doesn't have the reqest obj,
# so we can't grab it from the env
APP_HOST = 'localhost:4000'
POLL_INTERVAL = 360 # Seconds


