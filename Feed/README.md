# Local execution

To install dependencies, run

   npm install

## Configuration

The processor uses layered configuration files to determine runtime operation.  In typical use, one "input" config and one "output" config are specified.

For example, to run the processor against live data sources and generate to a local development instance of EM-Public, use:

    node cli.js config/inputs/production.json config/outputs/localhost.json

This will write the resulting output files to:

    ./data/output

## Local testing scenarios

Various scenarios are available for testing locally.  These scenarios use historic and constucted data to generate data files and place them within the EM-Public build/data directory.

For example, Scenario 1a (BOM Severe Weather Incident without matching Ripe data) can be generated as follows:

    node cli.js config/inputs/sample.json config/inputs/scenario-1b.json config/outputs/localhost.json

This combines the sample data set with the scenario data files and generates the output to localhost.

# Containerisation

To containerise the app with docker, use the following:

## Setup for OSX

    boot2docker init
    boot2docker start
    $(boot2docker shellinit)

## Build a new image

    docker build -t osom-processor .

## Run the image

    docker run osom-processor

# Emergency Change

## Git flow process around making an emergency change

    git checkout master
    git flow hotfix start [change]
    npm version patch
    
... changes and commits ...
    
    git flow hotfix finish [change]
    git push
    git checkout master
    git push

## Releasing to Lambda

Run the following jenkins-ci job to update the PVT environment for final validation:

    Job name:	  EMPublic-Deploy-Feed-Prod
    ENVIRONMENT:  PVT
    AWS_ACCESS_KEY_ID:	As provided
    AWS_SECRET_ACCESS_KEY: As provided

Once ready for a release, run the following jenkins-ci job:

    Job name:	  EMPublic-Deploy-Feed-Prod
    ENVIRONMENT:  PROD
    AWS_ACCESS_KEY_ID:	As provided
    AWS_SECRET_ACCESS_KEY: As provided
