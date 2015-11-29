require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Popup' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(800,768)
  end

  scenario 'Should open incident popup from sidebar' do
    visit home_url
    inc = OSOM::Incident.fire_incident
    within_page(sidebar_page) do |page|
        page.click_incident_list
        page.click_feature inc.id
    end
    within_page(incidents_warnings_page) do |page|
      expect page.popup.has_content?(inc.title)
      expect page.popup.has_content?(inc.subtitle)
      expect page.popup.has_content?(inc.size)
      expect page.popup.has_content?(inc.location)
      expect page.popup.has_content?(inc.status)
    end
  end

  scenario 'Should open clustered incident popup from sidebar' do
    visit home_url
    inc = OSOM::Incident.clustered_incident
    within_page(sidebar_page) do |page|
      page.click_incident_list
      page.click_feature inc.id
    end
    within_page(incidents_warnings_page) do |page|
      expect page.popup.has_content?(inc.title)
      expect page.popup.has_content?(inc.subtitle)
      expect page.popup.has_content?(inc.size)
      expect page.popup.has_content?(inc.location)
      expect page.popup.has_content?(inc.status)
    end
  end

  scenario 'Should open warning popup from sidebar' do
    visit home_url
    inc = OSOM::Warning.fire_advice
    within_page(sidebar_page) do |page|
      page.click_warning_list
      page.click_feature inc.id
    end
    within_page(incidents_warnings_page) do |page|
      expect page.popup.has_content?(inc.title)
      expect page.popup.has_content?(inc.location)
    end
  end

end
