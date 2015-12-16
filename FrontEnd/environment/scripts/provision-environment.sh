#!/usr/bin/env bash
#
# VINE
# Jenkins AWS Environment provisioning script
#
# base2Services <itsupport@base2services.com>
#
# params:
#   DNS_SUBDOMAIN
#   DNS_DOMAIN
#   IS_PRODUCTION_SIZE

# legacy params to remove:
#   NICS_BUILD_VERSION
# cloudformation template location
#   S3_REGION_DOMAIN
#   CLOUDFORMATION_BUCKET
#   CLOUDFORMATION_NICS_S3_TEMPLATE


[ -r /etc/environment ] && . /etc/environment

SCRIPT_DIR=`dirname $0`
STACK_TIMEOUT_MINS="90"
S3_TEMPLATE="https://${S3_REGION_DOMAIN}/${CLOUDFORMATION_BUCKET}/${CLOUDFORMATION_NICS_S3_TEMPLATE}"
AWS_BIN=/usr/bin/aws

# Remove periods from build version number
NICS_BUILD_VERSION_FULL=${NICS_BUILD_VERSION}
NICS_BUILD_VERSION="`echo $NICS_BUILD_VERSION | sed 's/\.//g'`"

# Support fully versioned cloud formation stacks, created from the baking process
INSTALL_BASE_URL="https://s3-ap-southeast-2.amazonaws.com/source.nics.vine.vic.gov.au/Builds/NICS.cloudformation"
PARENT_TEMPLATE="${INSTALL_BASE_URL}/${NICS_BUILD_VERSION_FULL}/NICS.json"

# Logging method
function log() {
  LEVEL="${1^^}"
  MESSAGE="$2"
  DATESTAMP="`date +%r`"

  echo "${DATESTAMP} [${LEVEL}] -- ${MESSAGE}"
}

if [ ! -f $AWS_BIN ]; then
  log error "Could not locate AWS CLI tools (${AWS_BIN})"
  exit 1
fi

[ -z "${IS_PRODUCTION_SIZE}" ] && IS_PRODUCTION_SIZE="False"

log info "Checking S3 Stack Status"
$AWS_BIN cloudformation describe-stacks --stack-name=${DNS_SUBDOMAIN}-S3 2>&1 >/dev/null
if [ $? -ne 0 ]; then
    log info "Creating S3 Stack for ${DNS_SUBDOMAIN} environment"
    $AWS_BIN cloudformation create-stack --stack-name "${DNS_SUBDOMAIN}-S3" --template-url $S3_TEMPLATE $CLI_OPTS --parameters \
    ParameterKey=DNSSubDomain,ParameterValue=$DNS_SUBDOMAIN \
    ParameterKey=DNSDomain,ParameterValue=$DNS_DOMAIN \
    2>&1 >/dev/null
    if [ $? -ne 0 ]; then
      log fatal "Failed to initialize creation S3 Stack of the \"${DNS_SUBDOMAIN}\" environment!"
      exit 1
    fi

    # wait and watch until the stack update completes (or rolls back)
    python -u ${SCRIPT_DIR}/watch-cloudformation.py --region=ap-southeast-2 --sleep-time=5 "${DNS_SUBDOMAIN}"
    RETURN_STATE=$?

    if [ $RETURN_STATE -ne 0 ]; then
      log error "Failed to create stack \"${DNS_SUBDOMAIN}\"."
      exit 1
    fi
else
    log info "S3 Stack for ${DNS_SUBDOMAIN} environment already exists"
    exit 0
fi
