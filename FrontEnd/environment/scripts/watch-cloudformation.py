#!/usr/bin/env python
"""
Python script to watch a CloudFormation stack's events,
and exit/notify when the CF stack update or create finishes.
requirements:
pip install boto
pip install python-pushover (optional)
for pushover configuration, see the section on ~/.pushoverrc in the Configuration section:
http://pythonhosted.org/python-pushover/#configuration
for boto configuration, see the section on ~/.boto in the Getting Started guide:
http://docs.pythonboto.org/en/latest/getting_started.html#configuring-boto-credentials
##################
Copyright 2014 Jason Antman <jason@jasonantman.com> <http://www.jasonantman.com>
Free for any use provided that patches are submitted back to me.
The latest version of this script can be found at:
https://github.com/jantman/misc-scripts/blob/master/watch_cloudformation.py
CHANGELOG:
2014-12-12 jantman:
- initial script
2014-12-14 jantman:
- add better links to config docs
"""

import sys
import optparse
import logging
import re
import time
import os
import datetime

import boto.cloudformation
import boto.ec2

FORMAT = "[%(levelname)s %(filename)s:%(lineno)s - %(funcName)20s() ] %(message)s"
logging.basicConfig(level=logging.ERROR, format=FORMAT)
logger = logging.getLogger(__name__)

reported_events = set()

try:
    from pushover import init, Client, get_sounds
    have_pushover = True
except ImportError:
    logger.warning("Pushover support disabled; `pip install python-pushover` to enable it")
    have_pushover = False

def main(stack_name, region, sleeptime=10, pushover=False):
    global reported_events
    if pushover and not have_pushover:
        raise SystemExit("ERROR: to use pushover notifications, please `pip install python-pushover` and configure it.")

    cf = boto.cloudformation.connect_to_region(region)
    stack = cf.describe_stacks(stack_name)[0]
    while True:
        report_events(stack.describe_events())
        stack.update()
        if 'IN_PROGRESS' not in stack.stack_status:
            break
        time.sleep(sleeptime)

    if 'FAILED' in stack.stack_status:
        print(datetime.datetime.now().strftime("%r") +" [ERROR] -- Stack Events end - {s}".format(s=stack.stack_status))
        logger.error()
        if pushover:
            notify_pushover(False, stack.stack_status, stack_name)
        raise SystemExit(1)
    else:
        print(datetime.datetime.now().strftime("%r") +" [INFO] -- Stack Events end - {s}".format(s=stack.stack_status))
        if pushover:
            notify_pushover(True, stack.stack_status, stack_name)
        raise SystemExit(0)
        
def report_events(events):
    global reported_events
    """Gets a list of events for an AWS stack and logs the ones that have not already been logged"""

    events = set(map((lambda e: (e.timestamp, e.logical_resource_id, e.resource_status)), events))

    # if it's our first run, don't report anything already existing
    if len(reported_events) == 0:
        print(datetime.datetime.now().strftime("%r") +" [INFO] -- Skipping {e} existing events.".format(e=len(events)))
        reported_events = events

    to_report = events.difference(reported_events)

    for event in to_report:
        print(event[0].strftime("%r") +" [INFO] -- Resource "+ event[1] +" reported status of "+ event[2])

    reported_events = events.union(reported_events)
    
def notify_pushover(is_success, status, stack_name):
    """ send notification via pushover """
    msg = 'Operation on stack {n} finished with status {s}'.format(n=stack_name,
                                                                   s=status)
    title = '{n}: {s}'.format(n=stack_name,
                              s=status)
    if is_success:
        req = Client().send_message(msg, title=title, priority=0)
    else:
        req = Client().send_message(msg, title=title, priority=0, sound='falling')
    
def parse_args(argv):
    """ parse arguments/options """
    p = optparse.OptionParser(usage="usage: %prog [options] stack_name")

    p.add_option('-v', '--verbose', dest='verbose', action='store_true', default=False,
                 help='verbose (debugging) output')
    p.add_option('-s', '--sleep-time', dest='sleeptime', action='store', type=int, default=10,
                 help='time in seconds to sleep between status checks; default 10')
    p.add_option('-r', '--region', dest='region', action='store', default='us-east-1',
                 help='AWS region, default=us-east-1')
    push_default = False
    if os.path.exists(os.path.expanduser('~/.watch_jenkins_pushover')):
        push_default = True
    p.add_option('-p', '--pushover', dest='pushover', action='store_true', default=push_default,
                 help='notify on completion via pushover (default {p}; touch ~/.watch_jenkins_pushover to default to True)'.format(p=push_default))

    options, args = p.parse_args(argv)

    return options, args


if __name__ == "__main__":
    opts, args = parse_args(sys.argv[1:])

    if opts.verbose:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    if len(args) < 1:
        raise SystemExit("ERROR: you must specify a stack name")

    main(args[0], opts.region, sleeptime=opts.sleeptime, pushover=opts.pushover)
