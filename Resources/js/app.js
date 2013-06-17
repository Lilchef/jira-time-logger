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
 */
function App()
{
}

/*
 * Static variables and functions
 */

App.URL_LOG_WORK = 'issue/{issue}/worklog';

App.REQUEST_GET = 'GET';
App.REQUEST_POST = 'POST';

App._instance = null;

/**
 * Get the singleton instance
 * 
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

/*
 * Instances variables and functions
 */

App.prototype._config = null;

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
        $('input', this).each(function() {
            if (!$(this).val()) {
                errors.push($(this).attr('name')+' cannot be blank');
                return true;
            }
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return false;
        }

        // No errors, submit
        var values = [];
        $('input, select, textarea', this).each(function() {
            values[$(this).attr('name')] = $(this).val();
        });
        app.logTime.call(app, values);

        // Prevent regular form submission
        return false;
    });
};

App.prototype._fetchSubTasks = function()
{
    // TODO: get these via REST
    var subTypes = [
        {
            "name": "Sub-task"
        },
        {
            "name": "Triaging"
        },
        {
            "name": "Estimating"
        },
        {
            "name": "Reviewing"
        }
    ];
    
    for (var key in subTypes) {
        var name = subTypes[key].name;
        $('#type').append('<option value="'+name+'">'+name+'</option>\n');
    }
}

App.prototype._loadMain = function()
{
    this._registerReconfigureListener();
    this._registerFormListener();
    
    this._fetchSubTasks();
}

App.prototype._makeRequest = function(url, data, type, success, failure)
{
    url = url.replace(/^\//, '');
    type = (type) ? type : App.REQUEST_GET;
    success = (success) ? success : function() {};
    failure = (failure) ? failure : this._requestFailure;
    
    $.ajax({
        type: type,
        url: this.getConfig().get('urlBase')+this.getConfig().get('urlApi')+url,
        dataType: 'json',
        async: false,
        username: this.getConfig().get('username'),
        password: this.getConfig().get('password'),
        data: data,
        success: success,
        error: failure
    });
}

App.prototype._requestFailure = function(xhr, error, ex)
{
    console.log('Request failure: '+error);
    alert('There was a problem communicating with JIRA');
}

/**
 * Initialise the app
 */
App.prototype.init = function()
{
    this._config = new Config();
    this._config.init();
};

/**
 * Decide what to load
 */
App.prototype.load = function()
{
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
 */
App.prototype.getConfig = function()
{
    return this._config;
};

App.prototype.logTime = function(time, type, issue, close, description)
{
    if (!type) {
        var url = App.URL_LOG_WORK.replace('{issue}', issue);
        
        var data = {
            "author": {
                "name": this.getConfig().get('username'),
            },
            "updateAuthor": {
                "name": this.getConfig().get('username'),
            },
            "comment": description,
            "timeSpent": time
        };
        
        this._makeRequest(url, data, App.REQUEST_POST, function() {
            alert(time+' was successfully logged against '+issue);
            window.location = 'app://index.html';
        });
    }
}