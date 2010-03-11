class Account < DataMapper::Base
  attr_accessor :id, :network_id, :username, :crypted_password, :user_id, :disabled
  belongs_to :user
  property :network_id,                 :string, :nullable => false, :length => 1..255
  property :username,                   :string, :nullable => false, :length => 1..255
  property :crypted_password,           :string, :nullable => true, :length => 0..255
  property :disabled,                   :boolean, :nullable => false, :default  => false
  property :created_at,                 :datetime
  property :updated_at,                 :datetime

  before_save :encrypt_password

  def initialize(params)
    @password = params[:password]
    super
  end

  def encrypt_password
    self.crypted_password = encrypt(@password) if @password
  end

  def password
    return @password if @password
    if self.crypted_password
      @password = decrypt(self.crypted_password)
    else
      @password = nil
    end
  end

  def password=(p)
    @password = p
  end

  def encrypt(p)
    key = EzCrypto::Key.with_password account_salt, SYSTEM_KEY
    return key.encrypt64(p).chomp
  end

  def decrypt(p)
    key = EzCrypto::Key.with_password account_salt, SYSTEM_KEY
    return key.decrypt64(p)
  end

  protected

  def account_salt
    self.username + '--' + self.network_id
  end
end


