# require gemspec dependencies
require 'redcarpet'
module EditablePages
  class Engine < Rails::Engine
    isolate_namespace EditablePages
  end
end