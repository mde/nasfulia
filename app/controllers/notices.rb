class Notices < Application
  before :login_required
  provides :json, :xml
  def index
    ret = {:successes => [], :failures => []}
    data = []
    cache = session[:notices_cache] || []

    if params[:previous_session] and session[:notices_cache]
      data = cache
      ret[:cached_at] = session[:notices_cached_at] || 0
    else
      accts = current_user.accounts

      # Endow all the accounts with service methods for
      # gettting data
      extend_with_service_methods(accts)

      accts.each do |a|
        acct_data = { 
          :username => a.username,
          :network_name => a.config[:display],
          :network_id => a.network_id,
          :notice_type => 'account'
        }
        begin
          if not a.disabled
            list_data = a.get_list
            acct_data[:notice_count] = list_data.length
            data.concat(a.get_list)
            ret[:successes].push(acct_data)
          end
        rescue
          # Squelch, add basic failure notice to return data
          ret[:failures].push(acct_data)
        end
      end
      # Sort reverse-chronologically if there's any data
      if data.length > 0
        # Weed out duplicates
        data = filter_duplicates(data)
        # Newest first
        data = sort_reverse_chron(data)

        # Update cached notices, save last 100
        cache = data + cache # Prepend new stuff
        # Weed out duplicates again
        cache = filter_duplicates(cache)
        # Newest first
        cache = sort_reverse_chron(cache)
        # Save only the newest 100 entries
        cache = cache.slice(0..99)
        session[:notices_cache] = cache
        session[:notices_cached_at] = Time.now.to_i
      end
    end
    ret[:data] = data
    display ret
  end

  def create
    notice_text = params[:text]
    notice_accounts = nil
    if not params[:accounts].blank?
      notice_accounts = params[:accounts].split(',')
    end
    ret = {:successes => [], :failures => []}
    data = nil
    notice = Notice.new({:user_id => current_user.id,
      :content => notice_text})
    if notice.save
      accts = current_user.accounts

      # Endow all the accounts with service methods for
      # gettting data
      extend_with_service_methods(accts)

      accts.each do |a|
        acct_data = {:username => a.username,
          :network_name => a.config[:display],
          :network_id => a.network_id}
          if not a.disabled and
            (notice_accounts.nil? or
            notice_accounts.include?(a.id.to_s))
            begin
              if params[:mock_mode].blank?
                a.post_new(notice_text)
              end
              ret[:successes].push(acct_data)
            rescue
              # Squelch, add basic failure notice to return data
              ret[:failures].push(acct_data)
            end
          end
      end
    end
    display ret
  end

  def extend_with_service_methods(accts)
    accts.each do |acct|
      mod = Service::get_module(acct.network_id)
      # Don't try if you've disabled the fucking broken Pownce lib
      if mod
        acct.extend mod
      end
    end
  end

  def filter_duplicates(data)
    entry_text = {}
    ret = []
    ret = data.inject([]) do |arr, val|
      if not entry_text[val[:text]]
        entry_text[val[:text]] = true
        arr.push(val)
      end
      arr
    end
  end

  def sort_reverse_chron(data)
    data.sort do |a, b|
      dt_a = a[:created_at]
      dt_b = b[:created_at]
      r = dt_a <=> dt_b; r = 0 - r
    end
  end
end

