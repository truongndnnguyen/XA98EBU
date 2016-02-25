#!/bin/sh

rm ../em-public.zip
zip -r ../em-public.zip package.json lambda.js src/ config/ node_modules/
aws --profile=emcop-prod s3 --region='ap-northeast-1' cp ../em-public.zip s3://lambda.public.em.vic.gov.au/osom-processor/em-public.zip

aws --profile=emcop-prod --region='ap-northeast-1' lambda update-function-code --function-name 'osom-processor' --s3-bucket 'lambda.public.em.vic.gov.au' --s3-key 'osom-processor/em-public.zip' --publish
