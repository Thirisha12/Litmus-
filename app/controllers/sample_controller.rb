class SampleController < ApplicationController
    def index
      render html: "<h1>Hello from the Rails application!</h1>".html_safe
    end
  end
  
