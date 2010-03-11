memcache_hosts = ['127.0.0.1:11211']
CACHE = MemCache.new(memcache_hosts, { :namespace => 'nasfulia' })

Merb.logger.info("Loaded PRODUCTION Environment...")
Merb::Config.use { |c|
  c[:exception_details] = false
  c[:reload_classes] = false
  c[:log_level] = :error
  c[:log_file] = Merb.log_path + "/production.log"
  c[:session_store] = 'memcache'
}

# App host -- mail controller doesn't have the reqest obj,
# so we can't grab it from the env
APP_HOST = 'nasfulia.net'
POLL_INTERVAL = 360 # Seconds


