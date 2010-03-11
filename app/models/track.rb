class Track < DataMapper::Base
  attr_accessor :id, :network_id, :text, :disabled
  belongs_to :user
  property :network_id,                 :string, :nullable => false, :length => 1..255
  property :text,                       :string, :nullable => false, :length => 1..255
  property :disabled,                   :boolean, :nullable => false, :default  => false
  property :created_at,                 :datetime
  property :updated_at,                 :datetime
end



