require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Sidebar Filter' do

  before(:each) do
    page.driver.browser.manage.window.resize_to(1024,768)
    visit home_url
    within_page(sidebar_page) do |page|
      expect page.sidebar_visible?(false)
      page.switch_to_list_view
    end
  end

  scenario 'Should find the incident in the sidebar' do
    inc = OSOM::Incident.fire_incident
    within_page(sidebar_page) do |page|
      expect page.incident_feature_list.has_content?(inc.subtitle)
    end
  end

  scenario 'Should filter out the incident' do
    inc = OSOM::Incident.fire_incident
    within_page(sidebar_page) do |page|
      page.toggle_filter_by(inc.category)
      expect ! page.incident_feature_list.has_content?(inc.subtitle)
    end
  end

  scenario 'Should filter category on and off' do
    inc = OSOM::Incident.fire_incident
    within_page(sidebar_page) do |page|
      page.toggle_filter_by(inc.category)
      page.toggle_filter_by(inc.category)
    end
  end

end
