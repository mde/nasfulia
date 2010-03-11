require File.join(File.dirname(__FILE__), '..', '..', "lib", "authenticated_system", "authenticated_dependencies")
class Users < Application
  provides :xml

  skip_before :login_required

  def new
    only_provides :html
    @user = User.new(params[:user] || {})
    display @user
  end

  def create
    #use_invite = (Merb::environment == 'production')
    use_invite = false
    cookies.delete :auth_token
    @user = User.new(params[:user])
    # Use invites in prod-mode
    if use_invite
      invitation_code = params[:user][:invitation_code]
      invite = DataMapper::database.query("select id from " +
        "invitations where invitation_code = ? and used_at is null;", invitation_code)
      invite = invite[0] if invite
      if not invite
        @user.errors.errors['invitation_code'] = ["Invalid invitation code."]
      end
    end
    if @user.errors.errors.length == 0 and @user.save
      if use_invite
        DataMapper::database.execute("update invitations set used_at = now(), " +
          "login = ? where invitation_code = ?;", @user.login, invitation_code)
      end
      'ok'
    else
      error_messages_for @user
      #render :new
    end
  end

  def activate
    self.current_user =
      User.find_activated_authenticated_model(params[:activation_code])
    if logged_in? && !current_user.active?
      current_user.activate
    end
    redirect '/'
  end
end
