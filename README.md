Editable Pages
=====

Editable content pages for your site.



## Setup

    create_table "editable_pages_pages", :force => true do |t|
      t.string   "title"
      t.string   "path"
      t.datetime "created_at", :null => false
      t.datetime "updated_at", :null => false
    end

    create_table "editable_pages_sections", :force => true do |t|
      t.text     "body"
      t.string   "identifier"
      t.string   "page_title"
      t.datetime "created_at", :null => false
      t.datetime "updated_at", :null => false
      t.integer  "position"
    end