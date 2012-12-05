module EditablePages
  class Section < ActiveRecord::Base
    self.table_name = 'editable_pages_sections'
    
    belongs_to :page, :primary_key => :page_title, :foreign_key => :title
    
    def self.find!(page_title, identifier)
      Page.find!(page_title).sections.where(:identifier => identifier).first_or_create!(:body => "Content for #{identifier} goes here. Click edit this page to change this content.")
    end  
  end
end