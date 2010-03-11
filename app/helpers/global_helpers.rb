module Merb
  module GlobalHelpers
    def esc_json_text(t)
      t.gsub('\\"', '\\\\\\\\"').gsub("'", "\\\\'").gsub(/\\n|\\r|\\t/, '')
    end
  end
end
