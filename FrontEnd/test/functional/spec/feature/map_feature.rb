require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Incidents and Warnings Page' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(800,768)
  end

  scenario 'Should cycle between hybrid, satellite and cartographic map layers' do
    visit home_url
    within_page(incidents_warnings_page) do |page|
      find('#layer-toggle').click
      expect page.has_content?(' | Vicmap Satellite')
      find('#layer-toggle').click
      expect page.has_content?(' | Vicmap Hybrid')
      find('#layer-toggle').click
      expect page.has_content?(' | Vicmap Cartographic')
    end
  end

  scenario 'Should zoom in and out' do
    visit home_url
    within_page(incidents_warnings_page) do |page|
      zoom = page.current_zoom_level
      page.zoom_in
      expect page.current_zoom_level == zoom + 1
      page.zoom_out
      expect page.current_zoom_level == zoom
    end
  end

  scenario 'Should zoom back to state level' do
    visit home_url
    within_page(incidents_warnings_page) do |page|
      zoom = page.current_zoom_level
      page.zoom_in
      expect page.current_zoom_level == zoom + 1
      page.zoom_state
      expect page.current_zoom_level == zoom
    end
  end

end
