Rails.application.routes.draw do
  namespace :editable_pages do
    resources :pages
  end
end