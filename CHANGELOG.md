# Changelog #
## 1.0 ##
### Bug fixes ###
* Subtask types are now correctly pulled in again

## 0.4 Beta ##
### Bug fixes ###
* When more time is logged manually then has elapsed the time now correctly resets to zero
* Hyper-links in the activity log no longer disappear after the maximum log entries is hit

### Updates / New features ###
* Connection to JIRA is tested on startup and on re-configure
* Time / total logged resets are now added to the activity log
* Various code improvements

## 0.3 Beta ##
### Bug fixes ###
* Leftover seconds when time is logged are no longer lost
* When incorrect issue key is entered then corrected it is no longer highlighted as an error

### Updates / New features ###
* Hover over log entry to see date/time logged
* Total time logged displayed
* Manually entering time no longer resets elapsed time but rather deducts from it

## 0.2 Beta ##
### Updates / New features ###
* Improved styling
* Submit bug reports (email)
* Full form reset button
* Issue lookup
    + Display issue summary
* Stopwatch
    + With manual override
* Issue keys in activity log are clickable (which enters them in the issue field)
