$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "editable_pages/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "editable_pages"
  s.version     = EditablePages::VERSION
  s.authors     = ["Ryan Wallace", "Nicholas Jakobsen"]
  s.email       = ["contact@culturecode.ca"]
  s.summary     = "Editable content pages for your site."
  s.description = "Editable content pages for your site."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["Rakefile", "README.md"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 3.2"
  s.add_dependency "redcarpet", "2.0.0b5"
end