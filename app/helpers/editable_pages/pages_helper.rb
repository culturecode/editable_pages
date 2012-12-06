module EditablePages
  module PagesHelper
    def edit_page_link(page_title, html_options = {})
      link_to 'Edit Page', edit_editable_pages_page_path(Page.find!(page_title)), html_options
    end  

    # Renders the contents of an editable section
    def editable_section(page_title, section_identifier, options = nil)
      string = Section.find!(page_title, section_identifier).body

      return if string.blank?
      
      options ||= {:tables => true, :autolink => true, :space_after_headers => true, :hard_wrap => true}
      @markdown_renderers ||= {}

      unless renderer = @markdown_renderers[options]
        renderer = @markdown_renderers[options] = ::Redcarpet::Markdown.new(::Redcarpet::Render::HTML.new(options), options)
      end
      
      # Markup
      string.gsub!(/(\S+\.(?:jpg|jpeg|png))/i) do |match|
        thumbnail($1, :class => 'editable_content_thumbnail')
      end
      
      renderer.render(string).html_safe
    end  
  end
end