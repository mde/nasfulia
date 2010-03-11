class Tracks < Application
  before :login_required
  def index
    if params[:user_id] != current_user.login
      raise Unauthorized
    end
    render
  end

  def new
    render
  end

  def delete
    render
  end

  def create
    if params[:user_id] != current_user.login
      raise Unauthorized
    end
    params[:track][:disabled] = false
    @track = Track.new(params[:track])
    @track.user_id = current_user.id
    if @track.save
      redirect '/users/' + current_user.login + '/tracks'
    else
      puts @track.errors.errors.inspect
      raise "Could not add new track term."
    end
  end

  def update
    @track = Track.first :id => params[:id]
    if params[:track][:disabled] == 'true'
      params[:track][:disabled] = true
    else
      params[:track][:disabled] = false
    end
    if @track.update_attributes(params[:track])
      redirect '/users/' + current_user.login + '/tracks'
    else
      raise "Could not update track term."
    end
  end

  def destroy
    @track = Track.first :id => params[:id]
    if @track.destroy!
      redirect '/users/' + current_user.login + '/tracks'
    else
      raise "Could not update track term."
    end
  end
end
