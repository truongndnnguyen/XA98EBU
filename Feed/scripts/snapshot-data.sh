#!/bin/sh
ARC=archives/data-snapshot-`date +%d%b%H%M`.zip
zip -rq ${ARC} data
echo Archived to: ${ARC}

