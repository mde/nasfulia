class FollowLink < DataMapper::Base
  belongs_to :user
  belongs_to :follow, :class_name => 'User'
end


require 'digest/sha1'
begin
  require File.join(File.dirname(__FILE__), '..', '..', "lib", "authenticated_system", "authenticated_dependencies")
rescue
  nil
end
class User < DataMapper::Base
  include AuthenticatedSystem::Model

  has_many :accounts
  has_many :tracks
  has_many :notices
  has_many :follows, :class_name => 'User', :through => :follow_links

  attr_accessor :password, :password_confirmation

  property :login,                      :string, :nullable => false, :length => 3..40
  property :email,                      :string, :nullable => false, :length => 3..100
  property :crypted_password,           :string, :length => 255
  property :salt,                       :string, :length => 255
  property :activation_code,            :string, :length => 255
  property :activated_at,               :datetime
  property :remember_token_expires_at,  :datetime
  property :remember_token,             :string, :length => 255
  property :created_at,                 :datetime
  property :updated_at,                 :datetime
  property :url_profile_image,          :string, :length => 255
  property :location,                   :string, :length => 255
  property :follows_count,              :integer
  property :followed_by_count,          :integer
  property :bio,                        :text, :lazy => true
  property :prefs_data,                 :text, :lazy => true
  property :addressbook_data,           :text, :lazy => true

  validates_uniqueness_of     :login
  if Merb::environment == 'production'
    validates_uniqueness_of     :email
  end
  validates_presence_of       :password,                :if => proc {password_required?}
  validates_presence_of       :password_confirmation,   :if => proc {password_required?}
  validates_length_of         :password,                :within => 4..40, :if => proc {password_required?}
  validates_confirmation_of   :password,                :groups => :create

  before_save :encrypt_password
  before_create :make_activation_code
  after_create :send_signup_notification

  def login=(value)
    @login = value.downcase unless value.nil?
  end


  EMAIL_FROM = "donotreply@nasfulia.net"
  SIGNUP_MAIL_SUBJECT = "Welcome to Nasfulia.net.  Please activate your account."
  ACTIVATE_MAIL_SUBJECT = "Welcome to Nasfulia.net"

  # Activates the user in the database
  def activate
    @activated = true
    self.activated_at = Time.now.utc
    self.activation_code = nil
    save

    # send mail for activation
    UserMailer.dispatch_and_deliver(  :activation_notification,
                                  {   :from => User::EMAIL_FROM,
                                      :to   => self.email,
                                      :subject => User::ACTIVATE_MAIL_SUBJECT },

                                      :user => self )

  end

  def send_signup_notification
    UserMailer.dispatch_and_deliver(
        :signup_notification,
      { :from => User::EMAIL_FROM,
        :to  => self.email,
        :subject => User::SIGNUP_MAIL_SUBJECT },
        :user => self
    )
  end




end
