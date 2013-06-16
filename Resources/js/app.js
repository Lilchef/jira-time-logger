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
    // TODO
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