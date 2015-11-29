## Getting Started

This 'smoke test' suite has been developed in ruby & utilises a number of easy to use tools. Refer to the Gemfile for details.

## Configure your environment

### Install ruby

Ruby is best installed via a installer/manager of choice. On such combo is ruby-install + chruby (to manage ruby versions). Refer to .ruby-version for required ruby version...

On Mac:

    brew install chruby
    brew install ruby-install

    ruby-install ruby 2.1

### Install gem dependencies

    gem install bundler
    bundle install

### Install test dependencies

For browser testing, download & install latest firefox

For headless testing (on Mac):

    brew install phantomjs

Note, this browserless testing is not currently supported.

## Smoke away

### To run with firefox

    bundle exec rake

### To run with other browsers

    BROWSER=safari bundle exec rake
    BROWSER=chrome bundle exec rake
    BROWSER=internet_explorer bundle exec rake
    BROWSER=firefox bundle exec rake

## Accessibility testing

Accessibility testing is provided by phantomjs (install as above) and the access_lint gem.  First, ensure that the application has been served, then to test, do the following:

    bundle exec rake accessibility:audit

### Continuous testing

To perform continuous testing, retesting changed specs whenever they change on disk, use 'guard':

    bundle exec guard
