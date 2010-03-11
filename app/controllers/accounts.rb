class Accounts < Application
  provides :json, :js, :xml
  before :login_required
  def index
    if params[:user_id] != current_user.login
      raise Unauthorized
    end
    @accounts = current_user.accounts
    if params[:format]
      display @accounts
    else
      render
    end
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
    params[:account][:disabled] = false
    @account = Account.new(params[:account])
    @account.user_id = current_user.id
    if @account.save
      redirect '/users/' + current_user.login + '/accounts'
    else
      puts @account.errors.errors.inspect
      raise "Could not add new social network account."
    end
  end

  def update
    @account = Account.first :id => params[:id]
    update_params = {:username => params[:account][:username]}
    pass = params[:account][:password]
    if not pass.blank?
      update_params[:password] = pass
    end
    if params[:account][:disabled] == 'true'
      update_params[:disabled] = true
    else
      update_params[:disabled] = false
    end
    if @account.update_attributes(update_params)
      redirect '/users/' + current_user.login + '/accounts'
    else
      raise "Could not update social network account."
    end
  end

  def destroy
    @account = Account.first :id => params[:id]
    if @account.destroy!
      redirect '/users/' + current_user.login + '/accounts'
    else
      raise "Could not update social network account."
    end
  end
end
