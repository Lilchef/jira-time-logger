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
    var version = 0.2;
    this._getVersion = function()
    {
        return version;
    };
}

/*
 * Static variables and functions
 */

/**
 * @constant
 */
App.LOG_INFO = 'INFO';
/**
 * @constant
 */
App.LOG_WARN = 'WARN';
/**
 * @constant
 */
App.LOG_MAX_SUMMARY_LENGTH = 20;

/**
 * @static
 */
App._instance = null;

/**
 * @static
 */
App._maxLogs = 1;

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
 * Alert the user to something (intrusive)
 * 
 * @param String message
 * @static
 */
App.alertUser = function(message) {
    alert(message);
    App.notifyUser(message, App.LOG_WARN);
};

/**
 * Notify the user of something (non-intrusive)
 * 
 * @param String message
 * @param String level One of the App.LOG_* constants
 * @static
 */
App.notifyUser = function(message, level) {
    message = message.replace(/\n/g, '; ');
    level = (level) ? level : App.LOG_INFO;
    var colour = (level == App.LOG_WARN) ? '#b75b5b' : '#5bb75b';
    
    var userLog = $('<div class="userLog '+level.toLowerCase()+'">'+level+': '+message+'</div>');
    $('#userLogContainer').prepend(userLog);
    userLog.css({backgroundColor: colour})
            .show()
            .animate({backgroundColor: 'none'}, 1500);
    if ($('.userLog').length > App._maxLogs) {
        $('#userLogContainer :last-child').remove();
    }
};

/*
 * Instances variables
 */

/**
 * @type Config
 * @private
 */
App.prototype._config = null;

/**
 * @type Jira
 * @private
 */
App.prototype._jira = null;

/**
 * @type Integer
 * @private
 */
App.prototype._issueTimeout = null;

/*
 * Instances public methods
 */

/**
 * Initialise the app
 * 
 * @public
 */
App.prototype.init = function()
{
    if (!Config) {
        throw 'App cannot function without Config';
    }
    if (!Jira) {
        throw 'App cannot function without Jira';
    }
    
    // Ensure console.log is defined
    if (!console || !console.log) {
        console.log = function() {}
    }
    
    this._config = new Config();
    this._config.init();
    
    this._jira = new Jira(this._config);
    
    App._maxLogs = this._config.get('maxLogs', 'jtl');
};

/**
 * Decide what to load
 * 
 * @public
 */
App.prototype.load = function()
{
    // If config needs setting
    if (!this._config.ready()) {
        window.location = 'app://config.html';
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
    $('#summary').html('&nbsp;');
    if (full) {
        $('#loggerForm').get(0).reset();
        if ($('#closeLabel').hasClass('checked')) {
            $('#closeLabel').click();
        }
        return;
    }
    
    $('#time').val('');
    $('#issue').val('');
    $('#description').val('');
    // Deliberately leaving type and close alone
    
    $('#time').focus();
}

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
        workLogID = this._jira.logTime(time, issue, description);
        if (!workLogID) {
            App.alertUser('No work log was returned by JIRA!');
            return false;
        }
        
        var notification = time+' was successfully logged against '+issue;
        if (summary != '' && summary.indexOf(issue) < 0) {
            if (summary.length > App.LOG_MAX_SUMMARY_LENGTH) {
                summary = summary.substring(0, App.LOG_MAX_SUMMARY_LENGTH)+'...';
            }
            notification += ' ('+summary+')';
        }
        App.notifyUser(notification);
        
        if (close) {
            this.resolveCloseIssue(issue, this._config.get('mainTaskCloseTransition'));
        }
        
        this.resetForm();
        return true;
    }
    
    // Subtask
    // First check we're not already on a subtask
    var parentIssue = null;
    var parentIssueDetails = this._jira.getParent(issue);
    if (!parentIssueDetails) {
        parentIssue = issue;
    } else {
        parentIssue = parentIssueDetails.key;
        summary = parentIssueDetails.fields.summary;
        if (summary.length > App.LOG_MAX_SUMMARY_LENGTH) {
            summary = summary.substring(0, App.LOG_MAX_SUMMARY_LENGTH)+'...';
        }
        App.notifyUser(issue+' is a sub-task of '+parentIssue+' ('+summary+')');
    }
    
    var subTaskIssue = this._jira.getIssueSubTask(parentIssue, subtask);
    if (!subTaskIssue) {
        subTaskIssue = this._jira.createSubTask(parentIssue, subtask);
        if (!subTaskIssue) {
            App.alertUser('No subtask key was returned by JIRA!');
            return false;
        }
        
        App.notifyUser(subtask+' sub-task ('+subTaskIssue+') was created against '+parentIssue);
    }
    
    workLogID = this._jira.logTime(time, subTaskIssue, description);
    if (!workLogID) {
        App.alertUser('No work log was returned by JIRA!');
        return false;
    }

    App.notifyUser(time+' was successfully logged against '+subtask+' of '+parentIssue);
    
    if (close) {
        var issueToClose = '';
        var transition = '';
        if (subTaskIssue) {
            issueToClose = subTaskIssue;
            transition = this._config.get('subTaskCloseTransition');
        } else {
            issueToClose = issue;
            transition = this._config.get('mainTaskCloseTransition');            
        }
        this.resolveCloseIssue(issueToClose, transition);
    }
    
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
    var transitionID = this._jira.getTransitionID(issue, transition);
    if (!transitionID) {
        App.alertUser('Could not find '+transition+' transition in JIRA!\nCheck the ticket is in a resolve/closeable status.');
        return false;
    }

    var transitionSuccess = this._jira.transitionIssue(issue, transitionID);
    if (!transitionSuccess) {
        App.alertUser('Could not resolve/close '+issue+' in JIRA!');
        return false;
    }
    
    App.notifyUser(issue+' was successfully resolved/closed');
    return true;
};

/**
 * Get the config
 * 
 * @returns Config
 * @public
 */
App.prototype.getConfig = function()
{
    return this._config;
};

/**
 * Get the Jira instance
 * 
 * @returns Jira
 * @public
 */
App.prototype.getJira = function()
{
    return this._jira;
};

/*
 * Instances private methods
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
    $('#bugButton').click(function()
    {
        var email = 'bugs@aaronbaker.co.uk';
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
        $('#loggerForm li.warning').removeClass('warning');
        var errors = [];
        if (!$('#time').val().match(new RegExp(app.getConfig().get('timeRegex'))) || $('#time').val() == '') {
            $('#time').parent().addClass('warning');
            errors.push('\''+$('#time').val()+'\' does not appear to be a valid JIRA time phrase');
        }
        if (!$('#issue').val().match(new RegExp(app.getConfig().get('issueKeyRegex'))) || $('#issue').val() == '') {
            $('#issue').parent().addClass('warning');
            errors.push('\''+$('#issue').val()+'\' does not appear to be a valid JIRA issue key');
        }

        if (errors.length > 0) {
            App.alertUser(errors.join('\n'));
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

        app.logTime(values['time'], values['issue'].toUpperCase(), values['type'], values['close'], values['description']);

        // Prevent regular form submission
        return false;
    });
};

/**
 * Register a listener for keyup on the issue field
 * 
 * @private
 */
App.prototype._registerIssueKeyupListener = function()
{
    $('#issue').keyup(function()
    {
        if (this._issueTimeout) {
            clearTimeout(this._issueTimeout);
        }
        if (!$('#issue').val().match(new RegExp(App.getInstance().getConfig().get('issueKeyRegex'))) || $('#issue').val() == '') {
            $('#summary').html('&nbsp;');
            return;
        }
        $('#summary').text('Waiting...');
        this._issueTimeout = setTimeout(function()
        {
            $('#summary').text('Checking...');
            var issue = App.getInstance().getJira().getIssueSummary($('#issue').val());
            if (issue && issue.fields.summary) {
                $('#summary').text(issue.fields.summary);
            } else {
                $('#summary').text($('#issue').val()+' not found');
            }
        }, 500);
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
    
    this._registerReconfigureListener();
    this._registerFormListener();
    this._registerLogTimeListener();
    this._registerResetFormListener();
    this._registerBugListener();
    this._registerIssueKeyupListener();
    this._setVersionInfo();
    this._populateSubTaskTypes();
};

App.prototype._setVersionInfo = function()
{
    var version = this._getVersion();
    $('#version').text('(v'+version+')');
}

/**
 * Populate the subtask types dropdown
 * 
 * @private
 */
App.prototype._populateSubTaskTypes = function()
{
    var subTaskTypes = this._jira.getSubTaskTypes();
    $('#type').empty();
    if (!subTaskTypes) {
        $('#type').append('<option value="ERROR">ERROR</option>\n');
        App.alertUser('Could not load subtask types from JIRA!');
        Ti.App.exit();
        return;
    }
    $('#type').append('<option value="">Main Issue</option>\n');
    for (var id in subTaskTypes) {
        var name = subTaskTypes[id];
        $('#type').append('<option value="'+name+'">'+name+'</option>\n');
    }
};