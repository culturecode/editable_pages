# require gemspec dependencies
require 'redcarpet'

module EditablePages
  class Engine < Rails::Engine
    isolate_namespace EditablePages

    initializer 'editable_pages.action_controller' do
      ActiveSupport.on_load :action_controller do
        helper EditablePages::PagesHelper
      end
    end
  end
end