# Gotchas
While developing with `Gulp` we identified a couple of things to pay attention. Listed below are some of them.

#### NPM

* When things don't seem to work properly, try blowing away your `node_modules` folder
* Make sure you always use `--save-dev` when installing a dependency to be used with `Gulp`
* The latest version of something may not always be the right one for the job

#### Bower

* Like NPM, if something doesn't work properly blow away the `app/bower_components` folder
* Differently from NPM always use `--save` when installing a bower dependency
* Make sure the dependency comes from a trusted developer: most of them will come from Github so ensure that the Github user is the active developer/org of the dependency you are bringing over

#### Gulp

* It's async = 'nuff said, be careful
* Always create new tasks, try not to edit default tasks unless you really know what you're doing
* Use dependencies between tasks - don't reinvent the wheel, look for plugins
* Generators like `Yeoman` usually bring older versions of plugins. They will work fine until a new version of a plugin breaks everything else - be careful when updating and bringing new plugins
* Do not use minified versions of bower libraries in your HTML template - it will break `uglify`
* Make sure your dev environment and your CI environment is close enough - by that I mean that executing `npm --version` and `node --version` should yield the same version number

