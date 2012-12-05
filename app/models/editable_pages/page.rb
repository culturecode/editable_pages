module EditablePages
  class Page < ActiveRecord::Base
    self.table_name = 'editable_pages_pages'
    has_many :sections, :foreign_key => :page_title, :primary_key => :title, :order => 'position ASC, id ASC'
    
    accepts_nested_attributes_for :sections
    
    def self.find!(title)
      find_or_create_by_title(title)
    end
  end
end