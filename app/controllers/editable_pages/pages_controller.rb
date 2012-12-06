module EditablePages
  class PagesController < ApplicationController
    respond_to :html

    def index
      @pages = Page.all
    end

    def edit
      @page = Page.find(params[:id])      
    end

    def update
      @page = Page.find(params[:id])
      @page.update_attributes!(params[:editable_pages_page])
      redirect_to params[:return_to] || :back, :notice => 'Page updated'
    
    rescue ActiveRecord::RecordInvalid
      render :edit
    end
  end
end