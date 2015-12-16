#!/usr/bin/env bash
#
# EMCOP
# Jenkins Chef deployment script
#
# base2Services <itsupport@base2services.com>
#
set -e

[ -r /etc/environment ] && . /etc/environment

# Logging
function log() {
  LEVEL="${1}"
  MESSAGE="$2"
  DATESTAMP="`date +%r`"

  echo "${DATESTAMP} [${LEVEL}] -- ${MESSAGE}"
}

[ -z "${WEB_SRC_GIT_TAG}" ] && WEB_SRC_GIT_TAG="develop"
[ -z "${BUILD_NUMBER}" ] && BUILD_NUMBER="nobuild"

CURRENT_VERSION=`npm version | grep em-public | sed 's/.*:..\([0-9.]*\).*/\1/'`
RELEASE_VERSION="${CURRENT_VERSION}-empublic-${WEB_SRC_GIT_TAG}-${BUILD_NUMBER}"

log info "Performing release ${RELEASE_VERSION} from ${WEB_SRC_GIT_TAG}"

git checkout master
git checkout ${WEB_SRC_GIT_TAG}

git flow init -d
git flow release start "${RELEASE_VERSION}"
log info "Releasing web-src ${CURRENT_VERSION}"
git flow release finish -m "Release ${RELEASE_VERSION}" "${RELEASE_VERSION}"

git checkout master
log info "pushing branch master"
git push origin master

#ensure we are on the right branch
git checkout ${WEB_SRC_GIT_TAG}

log info "push release tag ${RELEASE_VERSION}"
git push origin "${RELEASE_VERSION}"

npm version patch -m "Bumped version from ${CURRENT_VERSION} to %s"

log info "Bumped version from ${CURRENT_VERSION}"

log info "pushing branch ${WEB_SRC_GIT_TAG}"
git push origin ${WEB_SRC_GIT_TAG}

log info "EMPublic Web-src version ${CURRENT_VERSION} successfully released"

exit 0
