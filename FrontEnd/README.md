# EMCOP EM-Public

Public information site for a state overview warnings and advisory site (Vic Emergency replacement).

## git setup

You can clone using ssh with a preshared SSH key with the following command:

    git clone ssh://git@gitlab7.tools.vine.vic.gov.au:2022/empublic/web-src.git

## Setup

You will need `NodeJS` installed. At time of writing the minimum node version used is `0.10.31`. You can either install **node** from [`brew`](http://brew.sh/) if you are on a Mac OS or download a binary from [NodeJS download page](http://nodejs.org/download/).

### Windows

On Windows you will need to install some additional tooling, including the following:

* [Python 2.7.10](https://www.python.org/downloads/windows/)

### All platforms

After you install you will need a couple of other things, namely [Bower](http://bower.io/) and [Gulp](gulpjs.com). To install them run the following:

    npm install -g bower gulp

Then you will have to run the below commands in the `em-public` folder:

    bower install
    npm install

The above will install the dependencies necessary to run the public information site. **Bower** will install front end dependencies such as jQuery and **NPM** will install build tools needed such as SASS preprocessor, JSHint, Javascript compression tools, etc.

## Running

Gulp will execute SASS preprocessor, run JSHint against the Javascript files and compress both of them. It generates a `dist` folder which contains the minified version of both production ready.

To build everything just run

     gulp

## Serving

As part of the development workflow you should be able to change the files and automatically see the changes on your browser. To run a lightweight webserver that will serve the content built simply run

    gulp watch

## Building a Distribution Package

There are various optimisations performed when building for distribution.  The dist target renders, uglifies, compresses, etc:

    gulp dist

The package target creates a zip:

    gulp package

## Testing

There are two testing targets: **unit** and **functional**.

### Unit Testing

The unit testing lives under `test/unit` and is done using [KarmaJS](karma-runner.github.io) + [Mocha](http://visionmedia.github.io/mocha/) + [Chai](http://chaijs.com/) + [Sinon](sinonjs.org)... explaining:

* Karma is an agnostic test runner
* Mocha is a testing library very similar to Jasmine, without the assertions
* ChaiJS is an assertion library
* Sinon is a mocking / stubbing / spying framework

To run the unit tests execute the following in your terminal:

    gulp unit-test

The above will run the tests only once. If you prefer to keep them alive while making changes, simply run..

    gulp unit-watch

### Functional Testing

The functional testing is done using RSpec and lives under `test/functional`. You will need Ruby 2.1.1. NodeJS is wiring the run of `rake` under its belt by spawning a process.

Before you can run the NodeJS task to execute the functional testing you will need to install dependencies yourself. Just run...

    cd test/functional
    bundle install

Then back to the root of the project run:

    gulp functional-test

And a Firefox browser should come up with automated testing.

## Continuous Integration

### Pushing to the main repo

All commits to the upstream repo will trigger a build on the Jenkins server.  The build will be triggered by a [Git Trigger Job](http://jenkins.tools.vine.vic.gov.au/view/EMPublic/job/EMPublic-Git-Trigger/), which will result in a server-side build happening in the [Build no tests job](http://jenkins.tools.vine.vic.gov.au/view/EMPublic/job/EMPublic-Build-No-Tests/).

### Creating a release

When a series of changes are ready for release, the develop branch can be promoted to release through the [Git Release jenkins job](http://jenkins.tools.vine.vic.gov.au/view/EMPublic/job/EMPublic-Git-Release/).  When triggered, it will:

* Create a new release based on the current develop branch
* Push this release into master
* Bump the version number by a patch level (*.*.1)
* Push the version bump back into the develop branch

## Git Flow

Git flow has been configured on this repo.  This means that the git-flow command should be installed before performing any development work.

    brew install git-flow

Once installed, set up your local repo and go for it.

To start developing, use the feature commands to work on a feature:

   git flow feature start [featurename]
   ...
   git flow feature finish [featurename]

To test a feature during development, or to share with other developers, publish the feature using:

   git flow feature publish [featurename]

When changes are pushed to the origin git server via publish or finish, jenkinsci will automatically trigger a CI build and publish the result to S3.  You can see the published build at:

     http://public-info.dev.devcop.em.vic.gov.au/em-public/origin/develop/index.html (develop branch)
     http://public-info.dev.devcop.em.vic.gov.au/em-public/origin/feature/[featurename]/index.html (published feature branch)

Once the feature has been completed (and pushed to the origin), it can be staged for release:

   git flow release start [releasename]
   ...
   git flow release finish [releasename]

Releases get merged into the master branch, and should get a new build via the jenkinsci CI job at:

     http://public-info.dev.devcop.em.vic.gov.au/em-public/origin/master/index.html

# Hotfixing a production environment

To start a hotfix, checkout master and pull to get the latest commits:

   git checkout master
   git pull

Then create a hotfix feature:

     git flow hotfix start emegencychangename

Make your changes and commit.

     git add .
     git commit -m'description of changes'
     git push --set-upstream origin hotfix/emegencychangename

This will trigger a build on the JenkinsCI server, an automatic publish to the feature site, and allow a QA build to be generated.

To view the hotfix change in your browser, go to:

   http://em-public.ci.devcop.em.vic.gov.au/em-public/origin/hotfix/emegencychangename/

Once you are happy with this change, generate a QA build by manually starting the JenkinsCI job:

     Job Name:  "EMPublic-Deploy-QA"
     WEB_SRC_GIT_TAG parameter: "hotfix/emegencychangename"

This will generate a new QA build for verification.

Once QA has been completed, the change can be merged into the master branch with git flow:

    npm version patch
    git flow hotfix finish emergencychangename

This will update the Master branch with the hotfix changes, and increment the patch version (*.*.1).

The production environments can then be released using the following JenkinsCI job:

    Job Name:  "EMPublic-Deploy-Prod"
    Environment:	PVT or Prod
    WEB_SRC_GIT_TAG:	master
    AWS_ACCESS_KEY_ID:	[as provided]
    AWS_SECRET_ACCESS_KEY:	[as provided]

It is recommended that a PVT release is made first and verified at:

   http://pvt.public.em.vic.gov.au/

The PROD release can then be made and verified with:

    http://prod.public.em.vic.gov.au/
