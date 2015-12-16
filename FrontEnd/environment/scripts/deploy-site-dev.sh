#!/bin/sh

ENV=$1

echo Deploying to environment http://${ENV}.devpublic.em.vic.gov.au/

aws s3 cp dist/ s3://${ENV}.devpublic.em.vic.gov.au/ --recursive
