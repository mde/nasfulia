class Notice < DataMapper::Base
  belongs_to :user
  property :content,                    :text
  property :reply_to_id,                :integer
  property :source,                     :string
  property :created_at,                 :datetime

  validates_presence_of                 :content

  def text
    @content
  end

  def text=(t)
    @content = t
  end
end


