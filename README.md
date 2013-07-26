# JIRA Time Logger #

This is a little app to help you log your time in [Atlassian's JIRA](https://www.atlassian.com/software/jira) software.

It acts as a stopwatch to monitor the length of time you've worked on something and then allows you to quickly log that time to JIRA.

### Notice ###
I wrote this app to suit a very specific workflow (whereby subtasks of specific types are used to be able to break down time spent on an issue for things like triaging and estimating) but it can be used for simpler workflows or you could always fork the project and make it suit your workflow :)

## Features ##
* Stopwatch to record time spent on current task
    + Can be reset or overridden
* Time can be logged against an issue or a subtask of an issue
    + If a subtask of the selected type does not exist it is created
* After time is logged the issue can optionally be resolved/closed
* Recent activity is logged for reference
    + Issue keys in the log can be clicked to re-use them

## Installation ##
Currently there is only a build for Linux systems (tested on Ubuntu 12.04). There may be a Windows version at some point (ask if you want one).

### Linux ###
* Download the tarball
* There is one dependency to install: `sudo apt-get install libjpeg62-dev`
* JTL uses [TideSDK](http://www.tidesdk.org/) which needs a place to store some config files: `mkdir ~/.tidesdk`
* JTL needs somewhere to live: `mkdir /path/of/choice/JiraTimeLogger`
* Help it unpack: `cd /path/of/choice/JiraTimeLogger && tar xzf /path/to/JIRA\ Time\ Logger-<version>.tgz`
* Then run it: `./JIRA\ Time\ Logger`

## Author & License ##
Copyright: Aaron Baker, 2013. JIRA and the JIRA logo &copy; Atlassian, Inc.

This work is licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/)

