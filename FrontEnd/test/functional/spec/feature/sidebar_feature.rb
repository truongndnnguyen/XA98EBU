require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Sidebar' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(800,768)
  end

  scenario 'Should toggle sidebar on and off' do
    visit home_url
    within_page(sidebar_page) do |page|
      expect page.sidebar_visible?(true)
      page.switch_to_map_view
      expect page.sidebar_visible?(false)
      page.switch_to_list_view
      expect page.sidebar_visible?(true)
    end
  end

end
