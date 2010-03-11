# Merb::Router is the request routing mapper for the merb framework.
#
# You can route a specific URL to a controller / action pair:
#
#   r.match("/contact").
#     to(:controller => "info", :action => "contact")
#
# You can define placeholder parts of the url with the :symbol notation. These
# placeholders will be available in the params hash of your controllers. For example:
#
#   r.match("/books/:book_id/:action").
#     to(:controller => "books")
#
# Or, use placeholders in the "to" results for more complicated routing, e.g.:
#
#   r.match("/admin/:module/:controller/:action/:id").
#     to(:controller => ":module/:controller")
#
# You can also use regular expressions, deferred routes, and many other options.
# See merb/specs/merb/router.rb for a fairly complete usage sample.

Merb.logger.info("Compiling routes...")
Merb::Router.prepare do |r|

  r.match("/login").to(:controller => "Sessions", :action => "create").name(:login)
  r.match("/logout").to(:controller => "Sessions", :action => "destroy").name(:logout)
  r.match("/users/activate/:activation_code").to(:controller => "Users", :action => "activate").name(:user_activation)
  r.resources :users
  r.resources :users do |users|
    users.resources :accounts
    users.resources :tracks
  end
  r.resources :sessions
  r.resources :notices

  r.match('/signup').to(:controller => 'users', :action =>'new')
  r.match('/').to(:controller => 'main', :action =>'index')
  r.match('/home').to(:controller => 'main', :action =>'home')
  
  # This is the default route for /:controller/:action/:id
  # This is fine for most cases.  If you're heavily using resource-based
  # routes, you may want to comment/remove this line to prevent
  # clients from calling your create or destroy actions with a GET
  #r.default_routes
end

