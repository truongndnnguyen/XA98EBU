require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Text-Only' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(800,768)
  end

  scenario 'Should toggle textonly on and off' do
    visit home_url
    within_page(sidebar_page) do |page|
      expect page.sidebar_visible?(true)
      expect page.textonly_visible?(false)
      page.toggle_textonly
      expect page.textonly_visible?(true)
      page.toggle_textonly
      expect page.textonly_visible?(false)
    end
  end

  scenario 'Should deeplink to textonly view' do
    visit home_url + '#textonly'
    within_page(sidebar_page) do |page|
      expect page.textonly_visible?(true)
    end
  end

end
