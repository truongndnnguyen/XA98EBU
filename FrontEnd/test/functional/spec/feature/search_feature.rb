require File.dirname(__FILE__) + '/../spec_helper'
require 'pry'

feature 'EM-Public Search' do

  before(:all) do
    page.driver.browser.manage.window.resize_to(640,768)
  end

  before(:each) do
    page.driver.browser.manage.window.resize_to(640,768)

    visit home_url

    within_page(sidebar_page) do |page|
      page.switch_to_list_view
      page.search
    end
  end

  # scenario 'Should display google search results' do
  #   within_page(search_page) do |page|
  #     page.search_google_for 'ballarat'
  #     eventually { expect page.search_results.has_content?('Ballarat VIC') }
  #   end
  # end

  # scenario 'Should display vicmap search results' do
  #   within_page(search_page) do |page|
  #     page.search_vicmap_for 'ballarat'
  #     eventually { expect page.search_results.has_content?('BALLARAT NORTH') }
  #   end
  # end

  # scenario 'Should display search panel' do
  #   within_page(search_page) do |page|
  #     expect page.search_visible?(true)
  #   end
  # end

end
