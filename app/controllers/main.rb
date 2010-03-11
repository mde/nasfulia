class Main < Application
  before :login_required
  def index
    redirect '/login'
  end
  def home
    @accounts = []
    current_user.accounts.each do |a|
      net = Service::get_module(a.network_id)
      if not a.disabled
        @accounts << {:id => a.id, :username => a.username,
          :network_id => a.network_id, :network_name => net.config[:display]}
      end
    end
    @tracks = []
    current_user.tracks.each do |t|
      if not t.disabled
        @tracks << {:id => t.id, :network_id => t.network_id, :text => t.text}
      end
    end
    puts @tracks.inspect
    render
  end
end
