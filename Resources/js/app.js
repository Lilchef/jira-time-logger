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
}

/*
 * Static variables and functions
 */

/**
 * @constant
 */
App.URL_CREATE_ISSUE = 'issue';
/**
 * @constant
 */
App.URL_GET_ISSUE = 'issue/{issue}';
/**
 * @constant
 */
App.URL_LOG_WORK = 'issue/{issue}/worklog';
/**
 * @constant
 */
App.REQUEST_GET = 'GET';
/**
 * @constant
 */
App.REQUEST_POST = 'POST';
/**
 * @constant
 */
App.LOG_INFO = 'INFO';
/**
 * @constant
 */
App.LOG_WARN = 'WARN';

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
 * Alert the user to something (intrusive)
 * 
 * @param String message
 * @static
 */
App.alertUser = function(message) {
    // May replace this with something nicer in future
    alert(message);
};

/**
 * Notify the user of something (non-intrusive)
 * 
 * @param String message
 * @static
 */
App.notifyUser = function(message, level) {
    level = (level) ? level : App.LOG_INFO;
    
    var userLog = $('<div class="userLog '+level.toLowerCase()+'">'+level+': '+message+'</div>');
    $('#userLogContainer').prepend(userLog);
    userLog.css({backgroundColor: '#5bb75b'})
            .show()
            .animate({backgroundColor: 'none'}, 1500);
};

/*
 * Instances variables and functions
 */

/**
 * @type Config
 * @private
 */
App.prototype._config = null;

/**
 * @type Array
 * @private
 */
App.prototype._subTaskTypes = [];

/**
 * @type Object
 * @private
 */
App.prototype._ajaxValues = {};

/**
 * Register a listener for the config form submission
 * 
 * @private
 */
App.prototype._registerReconfigureListener = function()
{
    $('#reconfigureButton').click(function() {
        window.location = 'app://config.html';
        // Prevent regular form submission
        return false;
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
    $('#loggerForm').submit({"app": app}, function(event) {
        var app = event.data.app;
        // Validtion
        var errors = [];
        if (!$('#time').val().match(new RegExp(app.getConfig().get('timeRegex')))) {
            errors.push('\''+$('#time').val()+'\' does not appear to be a valid JIRA time phrase');
        }
        if (!$('#issue').val().match(new RegExp(app.getConfig().get('issueKeyRegex')))) {
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
        });

        app.logTime(values['time'], values['issue'], values['type'], values['close'], values['description']);

        // Prevent regular form submission
        return false;
    });
};

/**
 * Fetch the sub-task types from JIRA
 * 
 * @private
 */
App.prototype._fetchSubTaskTypes = function()
{
    if (!this._subTaskTypes || this._subTaskTypes.length == 0) {
        // TODO: get these via REST
        this._subTaskTypes = {
            "5": "Sub-task",
            "16": "Triaging",
            "15": "Estimating",
            "14": "Reviewing"
        };
    }
    
    return this._subTaskTypes;
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
    
    var subTaskTypes = this._fetchSubTaskTypes();
    for (var id in subTaskTypes) {
        var name = subTaskTypes[id];
        $('#type').append('<option value="'+name+'">'+name+'</option>\n');
    }
};

/**
 * 
 * @param String url_slug The URL slug to make the request to 
 * @param Object data The JSON data to send
 * @param String type (Optional) The type of request, one of the App.REQUEST_* constants
 * @param function success (Optional) Success callback
 * @param function failure (Optional) Failure callback
 * @private
 */
App.prototype._makeRequest = function(urlSlug, data, type, success, failure)
{
    urlSlug = urlSlug.replace(/^\//, '');
    type = (type) ? type : App.REQUEST_GET;
    success = (success) ? success : function() {};
    failure = (failure) ? failure : this._requestFailure;
    
    var urlFull = this.getConfig().get('urlBase')+this.getConfig().get('urlApi')+urlSlug;
    var authBase64 = $.base64.encode(this.getConfig().get('username')+':'+this.getConfig().get('password'));
    var headerAuth = 'Basic '+authBase64;

    $.ajax({
        type: type,
        url: urlFull,
        dataType: 'json',
        // Make requests synchronously, this is important for process flow control
        async: false,
        context: this,
        headers: {
            'Authorization': headerAuth,
            'Content-Type': 'application/json'
        },
        data: data ? JSON.stringify(data) : '{}',
        success: success,
        error: failure
    });
};

/**
 * Default refuest failure handler
 * 
 * @param jqXhr xhr
 * @param String status
 * @param String ex
 * @private
 */
App.prototype._requestFailure = function(xhr, status, ex)
{
    console.log('Request failure: '+status+', '+ex);
    App.alertUser('ERROR: There was a problem communicating with JIRA');
};

/**
 * Create a subtask for an issue
 * 
 * @param String issue The JIRA issue key
 * @param String type (Optional) The type of subtask
 * @returns String They JIRA key of the new subtask
 * @public
 */
App.prototype._createSubTask = function(issue, type)
{
    var url = App.URL_CREATE_ISSUE;
    var now = new Date();

    var data = {
        "fields": {
            "project":
            {
                "key": issue.substring(0,2)
            },
            "parent": {
                "key": issue
            },
            "summary": type+' '+issue,
            "description": type+' '+issue,
            "issuetype": {
                "name": type
            }
        }
    };

    this._makeRequest(url, data, App.REQUEST_POST, function(data) {
        if (!data.key) {
            App.alertUser('ERROR: no subtask key returned by JIRA');
            return;
        }
        
        this._ajaxValues.requestedSubTaskIssue = data.key;
        App.notifyUser(this._ajaxValues.requestedSubTaskType+' sub-task was created on '+issue);
    });
}

/**
 * Make sure a given type of subtask exists for an issue
 * 
 * @param String issue The JIRA issue key
 * @param String type (Optional) The type of subtask
 * @returns String They JIRA key of the subtask
 * @public
 */
App.prototype._ensureIssueHasSubTask = function(issue, type)
{
    this._ajaxValues.requestedSubTaskType = type;
    this._ajaxValues.requestedSubTaskIssue = null;
    
    // Get the details of the main issue
    var url = App.URL_GET_ISSUE.replace('{issue}', issue)+'?expand=subtasks';
    this._makeRequest(url, null, App.REQUEST_GET, function(data) {
        if (!data.fields.subtasks) {
            return;
        }
        for (var index in data.fields.subtasks) {
            if (data.fields.subtasks[index].fields.issuetype.name == this._ajaxValues.requestedSubTaskType) {
                this._ajaxValues.requestedSubTaskIssue = data.fields.subtasks[index].key;
                return;
            }
        }
    });

    // If there wasn't a suitable subtask create one
    if (!this._ajaxValues.requestedSubTaskIssue) {
        // _createSubTask() will set _requestedSubTaskIssue
        this._createSubTask(issue, type);
    }
    
    return this._ajaxValues.requestedSubTaskIssue;
};

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
    
    // Ensure console.log is defined
    if (!console || !console.log) {
        console.log = function() {}
    }
    
    this._config = new Config();
    this._config.init();
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
 * Reset the time logger form
 * 
 * @param Boolean full Reset all elements of the form. Defaults to intelligent reset.
 * @public
 */
App.prototype.resetForm = function(full)
{
    if (full) {
        $('#loggerForm').reset();
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
 * @param String type (Optional) The type of work done. Defaults to main task
 * @param Boolean close (Optional) Should the issue / sub-task be closed? Default: false
 * @param String description (Optional) Description of the work done
 * @public
 */
App.prototype.logTime = function(time, issue, type, close, description)
{
    if (!type) {
        this._makeTimeLogRequest(time, issue, description);
        
        App.notifyUser(time+' was successfully logged against '+issue);
        this.resetForm();
        
        return;
    }
    
    var subTaskIssue = this._ensureIssueHasSubTask(issue, type);
    if (!subTaskIssue) {
        return;
    }
    this._makeTimeLogRequest(time, subTaskIssue, description);

    App.notifyUser(time+' was successfully logged against '+issue);
    this.resetForm();
};

/**
 * Actually tog time to JIRA
 * 
 * @param String time The time to log in JIRA time format (1d 1h 1m)
 * @param String issue The JIRA issue key
 * @param String type (Optional) The type of work done. Defaults to main task
 * @private
 */
App.prototype._makeTimeLogRequest = function(time, issue, description)
{
    var url = App.URL_LOG_WORK.replace('{issue}', issue);
    var now = new Date();

    var data = {
        "comment": description,
        "started": now.toISOString().replace(/Z$/, '+0000'),
        "timeSpent": time
    };

    this._makeRequest(url, data, App.REQUEST_POST, function(data) {
        if (!data.id) {
            App.alertUser('ERROR: no work log returned by JIRA');
            return;
        }
    });

    return;
};