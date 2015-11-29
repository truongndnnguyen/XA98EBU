# EM-Public Backend Logic

## Building

This is a nodejs application with gulp build management.  Start by installing the relevant NPM modules:

    npm install

Then run the backend with gulp:

    gulp

## Deployment

The application is designed to be deployed in AWS using the API Gateway and Lambda.  Deployment is gulp driven, as follows:

    gulp deploy

This will create the API Gateway endpoints and deploy the lambda functions.

# API

This application provides an API, as described in the INTERFACE.md document.
