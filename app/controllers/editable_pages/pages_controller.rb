module EditablePages
  class PagesController < ApplicationController
    respond_to :html

    def index
      @pages = Page.all
    end

    def update
      @page = Page.find(params[:id])
      flash[:notice] = 'User was successfully created.' if @page.update_attributes(params[:page])
      respond_with(@page)
    end
  end
end