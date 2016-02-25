#!/bin/sh

gulp build
aws s3 --region='ap-northeast-1' cp build/em-public-feed.zip s3://lambda.em-public.em.vic.gov.au/feed-src/em-public-feed.zip
aws --region='ap-northeast-1' lambda update-function-code --function-name 'em-public-feed' --s3-bucket 'lambda.em-public.em.vic.gov.au' --s3-key 'feed-src/em-public-feed.zip' --publish
