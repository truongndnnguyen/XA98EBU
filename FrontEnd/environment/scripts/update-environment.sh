#!/usr/bin/env bash
#
# VINE
# Jenkins Environment update script
#
# base2Services <itsupport@base2services.com>
#

[ -r /etc/environment ] && . /etc/environment

SCRIPT_DIR=`dirname $0`
STACK_UID="$ENVIRONMENT_NAME"
STACK_TIMEOUT_MINS="45"
AWS_BIN=/usr/bin/aws

# Logging method
function log() {
  LEVEL="${1^^}"
  MESSAGE="$2"
  DATESTAMP="`date +%r`"

  echo "${DATESTAMP} [${LEVEL}] -- ${MESSAGE}"
}

# Remove periods from build version number
NICS_BUILD_VERSION_FULL=${NICS_BUILD_VERSION}
NICS_BUILD_VERSION="`echo $NICS_BUILD_VERSION | sed 's/\.//g'`"

INSTALL_BASE_URL="https://s3-ap-southeast-2.amazonaws.com/source.nics.vine.vic.gov.au/Builds/NICS.cloudformation"
STACK_URL="${INSTALL_BASE_URL}/${NICS_BUILD_VERSION_FULL}/NICS.json"

if [ ! -f $AWS_BIN ]; then
  log error "Could not locate AWS CLI tools (${AWS_BIN})"
  exit 1
fi

[ -z "${IS_PRODUCTION_SIZE}" ] && IS_PRODUCTION_SIZE="False"

# Update stack from template
log info "Updating Stack $STACK_UID with version $NICS_BUILD_VERSION"
$AWS_BIN cloudformation update-stack --stack-name "${STACK_UID}" --template-url $STACK_URL --capabilities CAPABILITY_IAM \
--parameters \
ParameterKey=InstallBaseURL,ParameterValue=$INSTALL_BASE_URL \
ParameterKey=IsProductionSize,ParameterValue=$IS_PRODUCTION_SIZE \
ParameterKey=DNSDomain,ParameterValue=$DNS_DOMAIN \
ParameterKey=DNSSubDomain,ParameterValue=$DNS_SUBDOMAIN \
ParameterKey=Route53ZoneId,ParameterValue=$DNS_ZONEID \
2>&1 >/dev/null
RETURN_STATE=$?

if [ $RETURN_STATE -ne 0 ]; then
  log error "Failed to initialize \"${STACK_UID}\" stack update of \"${ENVIRONMENT_NAME}\" environment."
  exit 1
fi

# wait and watch until the stack update completes (or rolls back)
python -u ${SCRIPT_DIR}/watch-cloudformation.py --region=ap-southeast-2 --sleep-time=5 "${STACK_UID}"
RETURN_STATE=$?

if [ $RETURN_STATE -ne 0 ]; then
  log error "Failed to create stack \"${STACK_UID}\" stack update of \"${ENVIRONMENT_NAME}\" environment."
  exit 1
fi

log info "Successfully updated \"${ENVIRONMENT_NAME}\" stack."

exit 0
