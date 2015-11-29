$: << "#{File.dirname(__FILE__)}/../lib"

require 'rubygems'
require 'rspec'
require 'capybara/rspec'
require 'capybara-screenshot'
require 'capybara-screenshot/rspec'

require File.dirname(__FILE__) + '/capybara_dsl_extensions'

Dir["#{File.dirname(__FILE__)}/../lib/*/*.rb"].each { |file| require file }
Dir["#{File.dirname(__FILE__)}/helpers/*_helper.rb"].each { |file| require file }
Dir["#{File.dirname(__FILE__)}/pages/*_page.rb"].each { |file| require file }

include EMPublic::Pages

Capybara.run_server = false

if (ENV['TARGET_URL'])
   Capybara.app_host = ENV['TARGET_URL']
   Capybara.server_port = 80
else
  Capybara.app_host = 'http://localhost:9000/respond/?ft=testdata#'
  Capybara.server_port = 9000
end

Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(app, :browser => :chrome)
end

Capybara.register_driver :internet_explorer do |app|
  Capybara::Selenium::Driver.new(app, :browser => :internet_explorer)
end

Capybara.register_driver :selenium_firefox do |app|
  Capybara::Selenium::Driver.new(app, :browser => :firefox)
end

Capybara.register_driver :safari do |app|
  Capybara::Selenium::Driver.new(app, :browser => :safari)
end

Capybara.default_driver = case ENV['BROWSER']
when 'chrome'
  :chrome
when 'firefox'
  :selenium_firefox
when 'webkit'
  :webkit
when 'ie'
  :internet_explorer
when 'safari'
  :safari
when 'poltergeist'
  :poltergeist
else
  :selenium_firefox
end

Capybara.ignore_hidden_elements = false
Capybara.save_and_open_page_path = 'spec/reports/screenshots'
Capybara::Screenshot.register_filename_prefix_formatter(:rspec) do |example|
  example.full_description.gsub(' ', '-').gsub(/^.*\/spec\//, '').gsub('/', '-')
end
Capybara::Screenshot.append_timestamp = false
Capybara::Screenshot.append_screenshot_path = false

def home_url
  '/'
end


def eventually(timeout = 5)
  begin_time = Time.now

  begin
    yield
  rescue => e
    sleep 0.25
    retry if (Time.now - begin_time) < timeout
    raise e
  end
end

def pause
  STDIN.getc
end

Capybara::Node::Element.class_eval do
  def click_at(x, y)
    eventually {
      driver.browser.action.move_to(native).move_by(x,y).click.perform
    }
  end
end
