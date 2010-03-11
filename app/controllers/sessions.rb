# require  'lib/authenticated_system_controller'
require File.join(File.dirname(__FILE__), '..', '..', "lib", "authenticated_system", "authenticated_dependencies")
class Sessions < Application
  provides :json

  skip_before :login_required
  def new
    render
  end

  def create
    if request.method == :get
      render :new
    else
      self.current_user = User.authenticate(params[:login], params[:password])
      if logged_in?
        if params[:remember_me] == "1"
          self.current_user.remember_me
          cookies[:auth_token] = { :value => self.current_user.remember_token,
            :expires => self.current_user.remember_token_expires_at }
        end
        # FIXME: Not sure where it's happening, but on logout
        # return_to gets set to '/' -- so you keep having to
        # log in twice
        if session[:return_to] == '/'
          session[:return_to] = '/home'
        end
        if params[:format]
          data = {:success => true, :session_id => session.session_id}
          display data
        else
          redirect_back_or_default('/home')
        end
      else
        if params[:format]
          data = {:success => false}
          display data
        else
          @msg = "Could not verify your account information."
          render :new
        end
      end
    end
  end

  def destroy
    self.current_user.forget_me if logged_in?
    cookies.delete :auth_token
    reset_session
    redirect '/'
  end

end
