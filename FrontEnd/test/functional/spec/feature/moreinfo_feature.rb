require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public More Info' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(800,768)
  end

  scenario 'Should open more info window from sidebar' do
    visit home_url
    warn = OSOM::Warning.fire_advice

    within_page(sidebar_page) do |page|
      page.click_feature_moreinfo warn.id
    end

    within_page(feature_info_page) do |page|
      page.title.has_content?(warn.title)
      page.body.has_content?(warn.location)
      page.click_close_btn
    end
  end

end
