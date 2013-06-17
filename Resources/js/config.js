/**
 * config.js file
 * 
 * Contains the Config class
 * 
 * @author Aaron Baker <me@aaronbaker.co.uk>
 * @copyright Aaron Baker 2013
 */

/**
 * Config class
 */
function Config()
{
}

Config.prototype._json = {};

/**
 * Load the JSON config
 * 
 * @private
 */
Config.prototype._loadJson = function()
{
    var customDocument = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(),'/config/config.json');
    // If the local config doesn't exist yet set it up
    if (!customDocument.exists()) {
        var destPath = customDocument.nativePath().split(Ti.Filesystem.getSeparator());
        destPath.pop();
        var destinationDir = Ti.Filesystem.getFile(destPath.join(Ti.Filesystem.getSeparator()));
        if ((destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
            alert('Error: could not create local config file');
            Ti.App.exit();
            return;
        }
        var document = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),'Resources/config/config.json');
        document.copy(Ti.Filesystem.getApplicationDataDirectory()+'/config/config.json');
    }
    customDocument.open(Ti.Filesystem.MODE_READ);
    this._json = JSON.parse(customDocument.read().toString());
};

/**
 * Register a listener for the config form submission
 * 
 * @private
 */
Config.prototype._registerFormListener = function()
{
    var config = this;
    $('#configForm').submit({"config": config}, function(event) {
        var config = event.data.config;
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

        // No errors, update the config
        $('input', this).each(function() {
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'urlBase') {
                if (!val.match(/^http(s)?:\/\//)) {
                    val = 'http://'+val;
                }
                val = val.replace(/\/$/, '');
            }
            config.set(name, val);
        });
        config.save();

        window.location = 'app://index.html';

        // Prevent regular form submission
        return false;
    });
};

/**
 * Initialise
 * 
 * @public
 */
Config.prototype.init = function()
{
    this._loadJson();
    this._registerFormListener();
};

/**
 * Check if the config is ready
 * 
 * @public
 */
Config.prototype.ready = function()
{
    for (var key in this._json.jira) {
        if (!this._json.jira[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Populate the configuration form
 * 
 * @public
 */
Config.prototype.populateForm = function()
{
    for (var key in this._json.jira) {
        if (this._json.jira[key]) {
            $('#'+key).val(this._json.jira[key]);
        }
    }

}

/**
 * Get a config option
 * 
 * @public
 * @param String attribute
 * @returns String
 */
Config.prototype.get = function(attribute)
{
    if (!this._json.jira[attribute]) {
        throw 'Unknown config requested: '+attribute;
    }

    return this._json.jira[attribute];
};

/**
 * Set a config option
 * 
 * @public
 * @param String attribute
 * @param String value
 */
Config.prototype.set = function(attribute, value)
{
    this._json.jira[attribute] = value;
};

/**
 * Save the config options
 * 
 * @public
 */
Config.prototype.save = function()
{
    var customDocument = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory(),'config/config.json');
    if (!customDocument.exists()) {
        var document = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),'Resources/config/config.json');
        document.copy(customDocument);
    }
    customDocument.open(Ti.Filesystem.MODE_WRITE);
    customDocument.write(JSON.stringify(this._json));
};