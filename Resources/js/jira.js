/**
 * jira.js file
 * 
 * Contains the Jira class.
 * 
 * @author Aaron Baker <me@aaronbaker.co.uk>
 * @copyright Aaron Baker 2013
 */

/**
 * Jira class
 * 
 * Handles communication with JIRA
 * 
 * @param Config config
 * @constructor
 */
function Jira(config)
{
    Jira.prototype._config = config;
}

/*
 * Static variables and functions
 */

/**
 * @constant
 */
Jira.URL_CREATE_ISSUE = 'issue';
/**
 * @constant
 */
Jira.URL_GET_ISSUE = 'issue/{issue}';
/**
 * @constant
 */
Jira.URL_LOG_WORK = 'issue/{issue}/worklog';
/**
 * @constant
 */
Jira.URL_ISSUE_TYPES = 'issuetype';
/**
 * @constant
 */
Jira.URL_TRANSITION = 'issue/{issue}/transitions';
/**
 * @constant
 */
Jira.REQUEST_GET = 'GET';
/**
 * @constant
 */
Jira.REQUEST_POST = 'POST';
/**
 * @constant
 */
Jira.TYPES_INC_SUBTASKS_NO = 0;
/**
 * @constant
 */
Jira.TYPES_INC_SUBTASKS_ONLY = 1;
/**
 * @constant
 */
Jira.TYPES_INC_SUBTASKS_YES = 2;

/*
 * Instance varaibles
 */

/**
 * @type Array
 * @private
 */
Jira.prototype._types = [];

/**
 * @type Object
 * @private
 */
Jira.prototype._ajaxValues = {};

/**
 * @type Object
 * @private
 */
Jira.prototype._transitions = {};

/*
 * Instance public methods
 */

/**
 * Get the issue types from JIRA
 * 
 * @param Integer subtasks One of the Jira.TYPES_INC_SUBTASKS_* constants
 * @return Object Issue/subtask types keyed by ID or null on failure
 * @public
 */
Jira.prototype.getIssueTypes = function(subTasks)
{
    if (!this._types || this._types.length == 0) {
        this._ajaxValues.types = null;
        var data = {};
        this._makeRequest(Jira.URL_ISSUE_TYPES, data, Jira.REQUEST_GET, function(data) {
            if (data.length > 0) {
                this._ajaxValues.types = [];
                this._ajaxValues.types[Jira.TYPES_INC_SUBTASKS_NO] = {};
                this._ajaxValues.types[Jira.TYPES_INC_SUBTASKS_ONLY] = {};
                this._ajaxValues.types[Jira.TYPES_INC_SUBTASKS_YES] = {};
                for (var index in data) {
                    var typeID = data[index].id;
                    var typeName = data[index].name;
                    var key = Jira.TYPES_INC_SUBTASKS_NO;
                    if (data[index].subtask) {
                        key = Jira.TYPES_INC_SUBTASKS_ONLY;
                        if ($.inArray(typeName, this._config.get('subTaskTypeExclusions')) >= 0) {
                            continue;
                        }
                    }
                    this._ajaxValues.types[key][typeID] = typeName;
                    this._ajaxValues.types[Jira.TYPES_INC_SUBTASKS_YES][typeID] = typeName;
                }
            }
        });
        
        this._types = this._ajaxValues.types;
    }
    
    if (!this._types[subTasks]) {
        return null;
    }
    
    return this._types[subTasks];
};

/**
 * Get the sub-task types from JIRA
 * 
 * Helper method
 * 
 * @return Object Subtask types keyed by ID or null on failure
 * @public
 */
Jira.prototype.getSubTaskTypes = function()
{
    return this.getIssueTypes(Jira.TYPES_INC_SUBTASKS_ONLY);
};

/**
 * Get a transitions ID
 * 
 * @param String issue The JIRA issue key
 * @param String transition The JIRA transition name
 * @returns Integer The JIRA transition ID
 */
Jira.prototype.getTransitionID = function(issue, transition)
{
    // TODO: Transitions are usually specific to projects but that's not always the case
    var transitionKey = issue.substring(0, issue.indexOf('-'))+':'+transition;
    
    if (!this._transitions[transitionKey]) {
        this._ajaxValues.requestedTransitionName = transition;
        this._ajaxValues.requestedTransitionID = null;
        var url = Jira.URL_TRANSITION.replace('{issue}', issue);
        var data = {};

        this._makeRequest(url, data, Jira.REQUEST_GET, function(data) {
            if (data.transitions && data.transitions.length > 0) {
                for (var index in data.transitions) {
                    if (data.transitions[index].name == this._ajaxValues.requestedTransitionName) {
                        this._ajaxValues.requestedTransitionID = data.transitions[index].id;
                        return;
                    }
                }
            }
        });
        
        this._transitions[transitionKey] = this._ajaxValues.requestedTransitionID;
    }
    
    return this._transitions[transitionKey];
};

/**
 * Log time to JIRA
 * 
 * @param String time The time to log in JIRA time format (1d 1h 1m)
 * @param String issue The JIRA issue key
 * @param String description (Optional) Description of the work done
 * @returns String The new worklog ID or null on failure
 * @private
 */
Jira.prototype.logTime = function(time, issue, description)
{
    this._ajaxValues.workLogID = null;
    
    var url = Jira.URL_LOG_WORK.replace('{issue}', issue);
    var now = new Date();
    now = now.toISOString().replace(/Z$/, '+0000');
    description = (description) ? description : "";

    var data = {
        "comment": description,
        "started": now,
        "timeSpent": time
    };

    this._makeRequest(url, data, Jira.REQUEST_POST, function(data) {
        if (!data.id) {
            return;
        }
        
        this._ajaxValues.workLogID = data.id;
    });

    return this._ajaxValues.workLogID;
};

/**
 * Get the key of the parent of a subtask
 * 
 * @param String issue The JIRA subtask issue key
 * @returns String The parent issue key or null
 */
Jira.prototype.getParent = function(issue)
{
    this._ajaxValues.requestedSubTaskParent = null;
    
    // Get the details of the issue
    var url = Jira.URL_GET_ISSUE.replace('{issue}', issue);
    this._makeRequest(url, null, Jira.REQUEST_GET, function(data) {
        if (!data.fields.parent) {
            return;
        }
        this._ajaxValues.requestedSubTaskParent = data.fields.parent.key;
    });
    
    return this._ajaxValues.requestedSubTaskParent;
};

/**
 * Make sure a given type of subtask exists for an issue
 * 
 * @param String issue The JIRA issue key
 * @param String type (Optional) The type of subtask
 * @returns String They JIRA key of the subtask or null on failure
 * @public
 */
Jira.prototype.getIssueSubTask = function(issue, type)
{
    this._ajaxValues.requestedSubTaskType = type;
    this._ajaxValues.requestedSubTaskIssue = null;
    
    // Get the details of the main issue
    var url = Jira.URL_GET_ISSUE.replace('{issue}', issue)+'?expand=subtasks';
    this._makeRequest(url, null, Jira.REQUEST_GET, function(data) {
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
    
    return this._ajaxValues.requestedSubTaskIssue;
};

/**
 * Create a subtask for an issue
 * 
 * @param String issue The JIRA issue key of the parent issue
 * @param String type (Optional) The type of subtask
 * @returns String They JIRA key of the new subtask or null on failure
 * @public
 */
Jira.prototype.createSubTask = function(issue, type)
{
    this._ajaxValues.requestedSubTaskIssue = null;
    
    var url = Jira.URL_CREATE_ISSUE;
    var now = new Date();

    var data = {
        "fields": {
            "project":
            {
                "key": issue.substring(0,issue.indexOf('-'))
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

    this._makeRequest(url, data, Jira.REQUEST_POST, function(data) {
        if (!data.key) {
            return;
        }
        
        this._ajaxValues.requestedSubTaskIssue = data.key;
    });
    
    return this._ajaxValues.requestedSubTaskIssue;
};

/**
 * Transition an issue
 * 
 * @param String issue The JIRA issue key
 * @param Integer transition The JIRA transition ID
 * @returns Boolean Success?
 * @public
 */
Jira.prototype.transitionIssue = function(issue, transition)
{
    this._ajaxValues.transitionSuccess = false;
    
    var url = Jira.URL_TRANSITION.replace('{issue}', issue);

    var data = {
        "transition": {
            "id": transition
        }
    };

    this._makeRequest(url, data, Jira.REQUEST_POST, function(data) {
        this._ajaxValues.transitionSuccess = true;
    });
    
    return this._ajaxValues.transitionSuccess;
};

/*
 * Instance private methods
 */

/**
 * Make a request to the JIRA API
 * 
 * @param String url_slug The URL slug to make the request to 
 * @param Object data The JSON data to send
 * @param String type (Optional) The type of request, one of the Jira.REQUEST_* constants
 * @param function success (Optional) Success callback
 * @param function failure (Optional) Failure callback
 * @private
 */
Jira.prototype._makeRequest = function(urlSlug, data, type, success, failure)
{   
    var urlBase = this._config.get('urlBase').replace(/\/$/, '');
    var urlApi = this._config.get('urlApi');
    urlSlug = urlSlug.replace(/^\//, '');
    type = (type) ? type : Jira.REQUEST_GET;
    success = (success) ? success : function() {};
    failure = (failure) ? failure : this._requestFailure;
    
    var urlFull = urlBase+urlApi+urlSlug;
    var authBase64 = $.base64.encode(this._config.get('username')+':'+this._config.get('password'));
    var headerAuth = 'Basic '+authBase64;

    $.ajax({
        type: type,
        url: urlFull,
        dataType: 'json',
        // Make requests synchronously, this is important for process flow control
        async: false,
        // Callback functions' "this" will be the current Jira instance
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
Jira.prototype._requestFailure = function(xhr, status, ex)
{
    console.log('Request failure: '+status+', '+ex);
};