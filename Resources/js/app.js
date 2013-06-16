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