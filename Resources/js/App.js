/**
 * app.js file
 * 
 * Contains the App class.
 * Requires the Config class.
 * 
 * @author Aaron Baker <me@aaronbaker.co.uk>
 * @copyright Aaron Baker 2013
 */

/**
 * App class
 * 
 * @constructor
 */
function App()
{
    /*
     * Private members
     */
    
    /**
     * @type String
     * @private
     */
    var version = Ti.App.getVersion();
    /**
     * @type String
     * @private
     */
    var bugReportEmail = 'bugs@aaronbaker.co.uk';
    /**
     * @type Config
     * @private
     */
    var config = null;
    /**
     * @type Jira
     * @private
     */
    var jira = null;
    /**
     * @type Stopwatch
     * @private
     */
    var stopwatch = null;
    /**
     * @type ActivityLog
     * @private
     */
    var activityLog = null;
    /**
     * @type Boolean
     * @private
     */
    var timeManual = false;
    /**
     * @type Integer
     * @private
     */
    var issueTimeout = null;
    /**
     * @type Integer
     * @private
     */
    var timeManualTimeout = null;
    /**
     * @type Object
     * @private
     */
    var loggedTotal = null;
    
    /*
     * Privileged (public) methods
     */
    
    /**
     * Get the version number of the app
     * 
     * @private
     */
    this.getVersion = function()
    {
        return version;
    };
    
    /**
     * Get the email address to send bug reports to
     * 
     * @private
     */
    this.getBugReportEmail = function()
    {
        return bugReportEmail;
    };

    /**
     * Get the config
     * 
     * @returns Config
     * @public
     */
    this.getConfig = function()
    {
        return config;
    };
    
    /**
     * Set the config
     * 
     * @param Config newConfig
     * @public
     */
    this.setConfig = function(newConfig)
    {
        if (!(newConfig instanceof Config)) {
            throw 'App.setConfig called with non-Config';
        }
        config = newConfig;
        return this;
    };

    /**
     * Get the Jira instance
     * 
     * @returns Jira
     * @public
     */
    this.getJira = function()
    {
        return jira;
    };
    
    /**
     * Set the Jira instance
     * 
     * @param Jira newJira
     * @public
     */
    this.setJira = function(newJira)
    {
        if (!(newJira instanceof Jira)) {
            throw 'App.setJira called with non-Jira';
        }
        jira = newJira;
        return this;
    };

    /**
     * Get the stopwatch
     * 
     * @returns Stopwatch
     * @public
     */
    this.getStopwatch = function()
    {
        return stopwatch;
    };
    
    /**
     * Set the stopwatch
     * 
     * @param Stopwatch newStopwatch
     * @public
     */
    this.setStopwatch = function(newStopwatch)
    {
        if (!(newStopwatch instanceof Stopwatch)) {
            throw 'App.setStopwatch called with non-Stopwatch';
        }
        stopwatch = newStopwatch;
        return this;
    };
    
    /**
     * Get the ActivityLog
     * 
     * @returns ActivityLog
     * @public
     */
    this.getActivityLog = function()
    {
        return activityLog;
    };
    
    /**
     * Set the ActivityLog
     * 
     * @param ActivityLog newActivityLog
     * @public
     */
    this.setActivityLog = function(newActivityLog)
    {
        if (!(newActivityLog instanceof ActivityLog)) {
            throw 'App.setActivityLog called with non-ActivityLog';
        }
        activityLog = newActivityLog;
        return this;
    };
    
    /**
     * Get whether to use manually entered time
     * 
     * @return Boolean
     * @public
     */
    this.getTimeManual = function()
    {
        return timeManual;
    };

    /**
     * Set whether to use manually entered time
     * 
     * @param Boolean manual
     * @public
     */
    this.setTimeManual = function(manual)
    {
        timeManual = Boolean(manual);
        return this;
    };
    
    /**
     * Get the issue timeout
     * 
     * @return Integer
     * @public
     */
    this.getIssueTimeout = function()
    {
        return issueTimeout;
    };

    /**
     * Set the issue timeout
     * 
     * @param Integer newIssueTimeout
     * @public
     */
    this.setIssueTimeout = function(newIssueTimeout)
    {
        issueTimeout = newIssueTimeout;
        return this;
    };
    
    /**
     * Get the manual time timeout
     * 
     * @return Integer
     * @public
     */
    this.getTimeManualTimeout = function()
    {
        return timeManualTimeout;
    };
    
    /**
     * Set the manual time timeout
     * 
     * @param Integer newTimeManualTimeout
     * @public
     */
    this.setTimeManualTimeout = function(newTimeManualTimeout)
    {
        timeManualTimeout = newTimeManualTimeout;
        return this;
    };
    
    /**
     * Get the logged total
     * 
     * @return Object
     * @public
     */
    this.getLoggedTotal = function()
    {
        return loggedTotal;
    };
    
    /**
     * Set the logged total
     * 
     * @param Object newLoggedTotal
     * @public
     */
    this.setLoggedTotal = function(newLoggedTotal)
    {
        loggedTotal = newLoggedTotal;
        return this;
    };
}

/*
 * Static variables and functions
 */

/**
 * @constant
 */
App.TIME_HOUR_LIMIT = 10;

/**
 * @static
 */
App._instance = null;

/**
 * Get the singleton instance
 * 
 * @static
 * @returns App
 */
App.getInstance = function()
{
    if (!App._instance) {
        App._instance = new App();
        App._instance.init();
    }
    
    return App._instance;
};

/**
 * Format an issue key for entry in the activity log
 * 
 * Makes it clickable for easy re-use
 * 
 * @param String JIRA issue key
 * @returns String
 */
App.formatIssueKeyForLog = function(issue)
{
    return '<a href="#" class="issueKey" title="Click to use as current issue">'+issue+'</a>';
};

/*
 * Instances public methods
 */

/**
 * Alert the user to something (intrusive)
 * 
 * @param String message
 * @public
 */
App.prototype.alertUser = function(message)
{
    alert(message);
    this.getActivityLog().error(message);
};

/**
 * Warn the user of something (non-intrusive)
 * 
 * @param String message
 * @public
 */
App.prototype.warnUser = function(message)
{
    this.getActivityLog().warn(message);
};

/**
 * Alert the user to something (non-intrusive)
 * 
 * @param String message
 * @public
 */
App.prototype.notifyUser = function(message)
{
    this.getActivityLog().info(message);
};

/**
 * Initialise the app
 * 
 * @public
 */
App.prototype.init = function()
{
    // Check dependencies
    if (!Config) {
        throw 'App cannot function without Config';
    }
    if (!Jira) {
        throw 'App cannot function without Jira';
    }
    if (!Stopwatch) {
        throw 'App cannot function without Stopwatch';
    }
    if (!ActivityLog) {
        throw 'App connot function without ActivityLog';
    }
    
    // Ensure console.log is defined
    if (!console || !console.log) {
        console.log = function() {}
    }
    
    this.setConfig(new Config());
    this.getConfig().init();
    this.setJira(new Jira(this.getConfig()));
    this.setStopwatch(new Stopwatch());
    this.setActivityLog(new ActivityLog(this.getConfig().get('maxLogs', 'jtl')));
};

/**
 * Check the configuration is correct
 * 
 * @return Boolean
 * @public
 */
App.prototype.checkConfig = function()
{
    if (!this.getConfig().ready()) {
        return false;
    }
    var mask = '<div id="mask">'
    mask += '<div id="maskText">Testing JIRA connection, please wait<br />';
    mask += '<img src="app://images/spinner.gif" alt="*" width="16" height="16" /></div>';
    mask += '</div>';
    $('body').append(mask);
    if (!this.getJira().testConnection()) {
        $('#mask').remove();
        return false;
    }
    
    $('#mask').remove();
    return true;
};

/**
 * Decide what to load
 * 
 * @public
 */
App.prototype.load = function()
{
    // If config needs setting
    if (!this.checkConfig()) {
        window.location = 'app://config.html?err=1';
        return;
    }

    // Default: Stay on index.
    this._loadMain();
};

/**
 * Reset the time logger form
 * 
 * @param Boolean full Reset all elements of the form. Defaults to intelligent reset.
 * @public
 */
App.prototype.resetForm = function(full)
{
    $('#loggerForm li.danger').removeClass('danger');
    $('#summary').html('&nbsp;');
    if (full) {
        $('#loggerForm').get(0).reset();
        if ($('#closeLabel').hasClass('checked')) {
            $('#closeLabel').click();
        }
        return;
    }
    
    $('#timeManual').val('');
    $('#issue').val('');
    $('#description').val('');
    // Deliberately leaving type and close alone
};

/**
 * Log time to JIRA
 * 
 * @param String time The time to log in JIRA time format (1d 1h 1m)
 * @param String issue The JIRA issue key
 * @param String subtask (Optional) The subtask worked on. Defaults to none (main task)
 * @param Boolean close (Optional) Should the issue / sub-task be closed? Default: false
 * @param String description (Optional) Description of the work done
 * @return Boolean Success?
 * @public
 */
App.prototype.logTime = function(time, issue, subtask, close, description)
{
    var workLogID = null;
    var summary = $('#summary').text();
    
    // If no subtask assume main task
    if (!subtask) {
        workLogID = this.getJira().logTime(time, issue, description);
        if (!workLogID) {
            this.alertUser('Failed to log '+time+' against '+App.formatIssueKeyForLog(issue)+': no work log was returned by JIRA!');
            return false;
        }
        
        var notification = time+' was successfully logged against '+App.formatIssueKeyForLog(issue);
        if (summary != '' && summary.indexOf(issue) < 0 && summary.indexOf('...') < 0) {
            if (summary.length > App.LOG_MAX_SUMMARY_LENGTH) {
                summary = summary.substring(0, App.LOG_MAX_SUMMARY_LENGTH)+'...';
            }
            notification += ' ('+summary+')';
        }
        this.notifyUser(notification);
        
        if (close) {
            this.resolveCloseIssue(issue, this.getConfig().get('mainTaskCloseTransition'));
        }
        
        this.addToLoggedTotal(this.jiraTimeToStopwatchTime(time));
        
        this.resetForm();
        return true;
    }
    
    // Subtask
    // First check we're not already on a subtask
    var parentIssue = null;
    var parentIssueDetails = this.getJira().getParent(issue);
    if (!parentIssueDetails) {
        parentIssue = issue;
    } else {
        parentIssue = parentIssueDetails.key;
        summary = parentIssueDetails.fields.summary;
        if (summary.length > App.LOG_MAX_SUMMARY_LENGTH) {
            summary = summary.substring(0, App.LOG_MAX_SUMMARY_LENGTH)+'...';
        }
        this.notifyUser(App.formatIssueKeyForLog(issue)+' is a sub-task of '+App.formatIssueKeyForLog(parentIssue)+' ('+summary+')');
    }
    
    var subTaskIssue = this.getJira().getIssueSubTask(parentIssue, subtask);
    if (!subTaskIssue) {
        subTaskIssue = this.getJira().createSubTask(parentIssue, subtask);
        if (!subTaskIssue) {
            this.alertUser('Failed to log '+time+' against '+App.formatIssueKeyForLog(issue)+': no subtask key was returned by JIRA!');
            return false;
        }
        
        this.notifyUser(subtask+' sub-task ('+App.formatIssueKeyForLog(subTaskIssue)+') was created against '+App.formatIssueKeyForLog(parentIssue));
    }
    
    workLogID = this.getJira().logTime(time, subTaskIssue, description);
    if (!workLogID) {
        this.alertUser('Failed to log '+time+' against '+App.formatIssueKeyForLog(issue)+': no work log was returned by JIRA!');
        return false;
    }

    this.notifyUser(time+' was successfully logged against '+subtask+' of '+App.formatIssueKeyForLog(parentIssue));
    
    if (close) {
        var issueToClose = '';
        var transition = '';
        if (subTaskIssue) {
            issueToClose = subTaskIssue;
            transition = this.getConfig().get('subTaskCloseTransition');
        } else {
            issueToClose = issue;
            transition = this.getConfig().get('mainTaskCloseTransition');            
        }
        this.resolveCloseIssue(issueToClose, transition);
    }
    
    this.addToLoggedTotal(this.jiraTimeToStopwatchTime(time));
    
    this.resetForm();
    return true;
};

/**
 * Resolve or close an issue in Jira
 * 
 * @param String issue The JIRA issue key
 * @param String transition The JIRA transition name
 * @returns Boolean Success?
 */
App.prototype.resolveCloseIssue = function(issue, transition)
{
    var transitionID = this.getJira().getTransitionID(issue, transition);
    if (!transitionID) {
        this.warnUser('Could not find '+transition+' transition in JIRA!\nIt\'s likely that the issue is already resolved/closed.');
        return false;
    }

    var transitionSuccess = this.getJira().transitionIssue(issue, transitionID);
    if (!transitionSuccess) {
        this.alertUser('Could not resolve/close '+issue+' in JIRA!');
        return false;
    }
    
    this.notifyUser(App.formatIssueKeyForLog(issue)+' was successfully resolved/closed');
    return true;
};

/**
 * Convert a Stopwatch time object to a JIRA time string
 * 
 * @param Object time
 * @returns String
 */
App.prototype.stopwatchTimeToJiraTime = function(time)
{
    var jiraTime = '';
    if (time.hour) {
        jiraTime = time.hour+'h ';
    }
    jiraTime += time.min+'m';
    
    return jiraTime;
};

/**
 * Convert a JIRA time string to a Stopwatch time object
 * 
 * @param String time
 * @returns Object
 */
App.prototype.jiraTimeToStopwatchTime = function(time)
{
    var stopwatchTime = {
        "hour": 0,
        "min": 0,
        "sec": 0
    };
    
    var timeParts = time.match(new RegExp(Jira.TIME_REGEX));
    if (timeParts[1]) {
        var days = parseInt(timeParts[1].replace(/[dD] ?/, ''));
        stopwatchTime.hour += (days * 24);
    }
    if (timeParts[2]) {
        var hours = parseInt(timeParts[2].replace(/[hH] ?/, ''));
        stopwatchTime.hour += hours;
    }
    if (timeParts[3]) {
        var mins = parseInt(timeParts[3].replace(/[mM]/, ''));
        stopwatchTime.min += mins;
    }
    
    return stopwatchTime;
};

/**
 * Update the elapsed time
 * 
 * @param Object (Optional) hour, min, sec. If not specified it is fetched from Stopwatch
 * @public
 */
App.prototype.updateTime = function(time)
{
    // This method can be called out of context (as a Stopwatch listener)
    // so 'this' may not be what we would expect
    var app = null;
    if (this instanceof App) {
        app = this;
    } else {
        app = App.getInstance();
    }
    
    if (!time) {
        time = app.getStopwatch().getTime();
    }
    
    var jiraTime = app.stopwatchTimeToJiraTime(time);
    
    $('.timeAuto').text(jiraTime);
    
    app.updateDayGrandTotal();
};

/**
 * Reset the automatic timer
 * 
 * @public
 */
App.prototype.resetTime = function()
{
    var currTime = this.getStopwatch().getTime();
    this.getStopwatch().restart();
    this.updateTime();
    if (currTime && (currTime.min || currTime.hour)) {
        this.notifyUser('The accrued time has been reset ('+this.stopwatchTimeToJiraTime(currTime)+' dropped)');
    }
    
    // If it looks like the time logger's been running overnight offer to reset the day total
    if (currTime.hour >= App.TIME_HOUR_LIMIT) {
        var resetLoggedTotal = confirm("It looks like this is a new day,\ndo you want to reset the logged total as well?");
        if (resetLoggedTotal) {
            this.resetLoggedTotal();
        }
    }
};

/**
 * Remove time from the elapsed total
 * 
 * @param String time JIRA time phrase
 * @public
 */
App.prototype.deductTime = function(time)
{
    this.getStopwatch().deductTime(this.jiraTimeToStopwatchTime(time));
    this.updateTime();
};

/**
 * Get the time to log
 * 
 * @returns String
 * @public
 */
App.prototype.getTimeToLog = function()
{
    if (this._timeManual) {
        return $('#timeManual').val();
    } else {
        var roundToNearest = 'min';
        var time = this.getStopwatch().getTime(roundToNearest);
        var jiraTime = this.stopwatchTimeToJiraTime(time);

        return jiraTime;
    }
};

/**
 * Add to the daily total
 * 
 * @param Object time hour, min, sec
 * @public
 */
App.prototype.addToLoggedTotal = function(time)
{
    var loggedTotal = this.getLoggedTotal();
    loggedTotal.hour += parseInt(time.hour);
    
    loggedTotal.min += parseInt(time.min);
    if (loggedTotal.min >= 60) {
        loggedTotal.min -= 60;
        loggedTotal.hour++;
    }
    
    this.setLoggedTotal(loggedTotal);
    this.updateLoggedTotal();
};

/**
 * Update the daily total time
 * 
 * @param Object (Optional) hour, min, sec. If not specified it is loaded from App
 * @public
 */
App.prototype.updateLoggedTotal = function(total)
{    
    if (!total) {
        total = this.getLoggedTotal();
    }
    
    var jiraTime = this.stopwatchTimeToJiraTime(total);
    
    $('#loggedTotal').text(jiraTime);
    
    this.updateDayGrandTotal();
};

/**
 * Reset the daily total
 * 
 * @private
 */
App.prototype.resetLoggedTotal = function()
{
    var currTotal = this.getLoggedTotal();
    var loggedTotal = {
        "hour": 0,
        "min": 0,
        "sec": 0
    };
    this.setLoggedTotal(loggedTotal);
    this.updateLoggedTotal();
    
    if (currTotal && (currTotal.min || currTotal.hour)) {
        this.notifyUser('The total logged time has been reset ('+this.stopwatchTimeToJiraTime(currTotal)+' dropped)');
    }
};

/**
 * Update the daily grand total time
 * 
 * @public
 */
App.prototype.updateDayGrandTotal = function()
{
    var logged = this.getLoggedTotal();
    var unlogged = this.getStopwatch().getTime();
    if (!logged || !unlogged) {
        return;
    }
    var grandTotal = {};
    grandTotal.min = logged.min;
    grandTotal.hour = logged.hour;
    
    grandTotal.min += unlogged.min;
    if (grandTotal.min >= 60) {
        grandTotal.min -= 60;
        grandTotal.hour++;
    }
    grandTotal.hour += unlogged.hour;
    
    var jiraTime = this.stopwatchTimeToJiraTime(grandTotal);
    
    $('#dayGrandTotal').text(jiraTime);
};

/*
 * Instance protected methods
 * No such thing in JavaScript, it's just conceptual
 */

/**
 * Register a listener for the config form submission
 * 
 * @private
 */
App.prototype._registerReconfigureListener = function()
{
    $('#reconfigureButton').click(function()
    {
        window.location = 'app://config.html';
        // Prevent regular form submission
        return false;
    });
};

/**
 * Register a listener for the Bug Report button
 * 
 * @private
 */
App.prototype._registerBugListener = function()
{
    var email = this.getBugReportEmail();
    $('#bugButton').click({"email": email}, function()
    {
        var subject = encodeURIComponent('JIRA Time Logger bug report');
        Ti.Platform.openURL('mailto:'+email+'?subject='+subject);
    });
};

/**
 * Register a listener for the main form submission
 * 
 * @private
 */
App.prototype._registerResetFormListener = function()
{
    $('#resetFormButton').click(function()
    {
        App.getInstance().resetForm(true);
    });
};

/**
 * Register a listener for the Log Time button
 * 
 * @private
 */
App.prototype._registerLogTimeListener = function()
{
    $('#logTimeButton').click(function()
    {
        $('#loggerForm').submit();
    });
};

/**
 * Register a listener for the main form submission
 * 
 * @private
 */
App.prototype._registerFormListener = function()
{
    var app = this;
    $('#loggerForm').submit({"app": app}, function(event)
    {
        var app = event.data.app;
        // Validtion
        $('#loggerForm li.danger').removeClass('danger');
        var errors = [];
        if (app.getTimeManual()) {
            if (!$('#timeManual').val().match(new RegExp(Jira.TIME_REGEX)) || $('#timeManual').val() == '') {
                $('#timeManual').parent().parent().parent().addClass('danger');
                errors.push('\''+$('#timeManual').val()+'\' does not appear to be a valid JIRA time phrase');
            }
        }
        if (!$('#issue').val().match(new RegExp(Jira.ISSUE_KEY_REGEX)) || $('#issue').val() == '') {
            $('#issue').parent().addClass('danger');
            errors.push('\''+$('#issue').val()+'\' does not appear to be a valid JIRA issue key');
        }

        if (errors.length > 0) {
            app.alertUser(errors.join('\n'));
            return false;
        }

        // No errors, submit
        var values = {};
        $('input, select, textarea', this).each(function() {
            values[$(this).attr('name')] = $(this).val();
            if ($(this).attr('type') == 'checkbox') {
                if ($(this).is(':checked')) {
                    values[$(this).attr('name')] = true;
                } else {
                    values[$(this).attr('name')] = false;
                }
            }
        });

        var time = app.getTimeToLog();
        var success = app.logTime(time, values['issue'].toUpperCase(), values['type'], values['close'], values['description']);
        if (!success) {
            return false;
        }
        
        if (app.getTimeManual()) {
            $('#clearTimeButton').click();
            app.deductTime(time);
        } else {
            app.resetTime();
        }

        // Prevent regular form submission
        return false;
    });
};

/**
 * Register a listener for clicks on the time field
 * 
 * @private
 */
App.prototype._registerTimeClickListener = function()
{
    var app = this;
    $('#timeAuto').click({"app": app}, function()
    {
        $(this).hide();
        $('#timeManual').show().focus();
        $('#clearTimeButton').text('Cancel');
        app.setTimeManual(true);
    });
};

/**
 * Register a listener for clicks on the clear time button
 * 
 * @private
 */
App.prototype._registerTimeClearListener = function()
{
    var app = this;
    $('#clearTimeButton').click({"app": app}, function()
    {
        if (app.getTimeManual()) {
            $('#timeManual').val('').keyup().hide();
            $('#timeAuto').show();
            $(this).text('Reset');
            app.setTimeManual(false);
        } else {
            app.resetTime();
        }
    });
};

/**
 * Listen for keyup on the manual time field
 * 
 * @private
 */
App.prototype._registerTimeManualKeyupListener = function()
{
    var app = this;
    $('#timeManual').keyup({'app': app}, function()
    {
        if (app.getTimeManualTimeout()) {
            clearTimeout(app.getTimeManualTimeout());
        }
        var timeManualTimeout = setTimeout(function()
        {
            if (!$('#timeManual').val().match(new RegExp(Jira.TIME_REGEX))) {
                $('#timeManual').parent().parent().parent().addClass('danger');
            } else {
                $('#timeManual').parent().parent().parent().removeClass('danger');
            }
        }, 500);
        app.setTimeManualTimeout(timeManualTimeout);
    });
};

/**
 * Register a listener for keyup on the issue field
 * 
 * @private
 */
App.prototype._registerIssueKeyupListener = function()
{
    var app = this;
    $('#issue').keyup({'app': app}, function()
    {
        if (app.getIssueTimeout()) {
            clearTimeout(app.getIssueTimeout());
        }
        $('#summary').text('Waiting...');
        var issueTimeout = setTimeout(function()
        {
            if (!$('#issue').val().match(new RegExp(Jira.ISSUE_KEY_REGEX)) || $('#issue').val() == '') {
                $('#issue').parent().addClass('danger');
                $('#summary').html('&nbsp;');
                return;
            }
         
            $('#issue').parent().removeClass('danger');
            $('#summary').text('Checking...');
            var issue = App.getInstance().getJira().getIssueSummary($('#issue').val());
            if (issue && issue.fields.summary) {
                $('#summary').text(issue.fields.summary);
            } else {
                $('#summary').text($('#issue').val()+' not found');
            }
        }, 500);
        app.setIssueTimeout(issueTimeout);
    });
};

/**
 * Register a listener for when issue key links are clicked
 * 
 * @private
 */
App.prototype._registerIssueKeyClickListener = function()
{
    $('body').on('click', 'a.issueKey', function()
    {
        $('#issue').val($(this).text());
        $('#issue').keyup();
        return false;
    });
};

/**
 * Register a listener for the reset day total button click
 * 
 * @private
 */
App.prototype._registerResetLoggedTotalClickListener = function()
{
    var app = this;
    $('#resetLoggedTotalButton').click({"app": app}, function()
    {
        app.resetLoggedTotal();
    });
};

/**
 * Load the main window
 * 
 * @private
 */
App.prototype._loadMain = function()
{
    // Check we're on the right page
    if (window.location.pathname != '/index.html') {
        window.location = 'app://index.html';
        return;
    }
    
    this._registerFormListener();
    this._registerLogTimeListener();
    this._registerResetFormListener();
    this._registerReconfigureListener();
    this._registerBugListener();
    this._registerTimeManualKeyupListener();
    this._registerTimeClickListener();
    this._registerTimeClearListener();
    this._registerIssueKeyupListener();
    this._registerIssueKeyClickListener();
    this._registerResetLoggedTotalClickListener();
    this._setVersionInfo();
    this._populateSubTaskTypes();
    
    this.resetLoggedTotal();
    this.getStopwatch().registerMinListener(this.updateTime);
    this.resetTime();
};

App.prototype._setVersionInfo = function()
{
    var version = this.getVersion();
    $('#version').text('(v'+version+')');
}

/**
 * Populate the subtask types dropdown
 * 
 * @private
 */
App.prototype._populateSubTaskTypes = function()
{
    var subTaskTypes = this.getJira().getSubTaskTypes();
    $('#type').empty();
    if (!subTaskTypes) {
        $('#type').append('<option value="ERROR">ERROR</option>\n');
        this.alertUser('Could not load subtask types from JIRA!');
        Ti.App.exit();
        return;
    }
    $('#type').append('<option value="">Main Issue</option>\n');
    for (var id in subTaskTypes) {
        var name = subTaskTypes[id];
        $('#type').append('<option value="'+name+'">'+name+'</option>\n');
    }
};