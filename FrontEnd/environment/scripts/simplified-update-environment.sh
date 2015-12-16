#!/bin/sh

# key parameters
DNS_SUBDOMAIN="$1"
DNS_DOMAIN="devpublic.em.vic.gov.au"

# environment configuration
AWS_BIN=/usr/local/bin/aws
STACK_NAME="${DNS_SUBDOMAIN}-devpublic-em-vic-gov-au"
TEMPLATE_BODY="file://environment/cloudformation/master.json"

# Logging method
function log() {
  LEVEL="${1}"
  MESSAGE="$2"
  DATESTAMP="`date +%r`"

  echo "${DATESTAMP} [${LEVEL}] -- ${MESSAGE}"
}

if [ ! -f $AWS_BIN ]; then
  log error "Could not locate AWS CLI tools (${AWS_BIN})"
  exit 1
fi

$AWS_BIN cloudformation update-stack --stack-name "${STACK_NAME}" --template-body "${TEMPLATE_BODY}" --parameters \
    ParameterKey=DNSSubDomain,ParameterValue=$DNS_SUBDOMAIN \
    ParameterKey=DNSDomain,ParameterValue=$DNS_DOMAIN
