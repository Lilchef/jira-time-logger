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
 * 
 * @constructor
 */
function Config()
{
}

/*
 * Instances variables and functions
 */

/**
 * @type Object
 * @private
 */
Config.prototype._json = {};

/**
 * Load the JSON config
 * 
 * @private
 */
Config.prototype._loadJson = function()
{
    var baseDocument = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),'Resources/config/config.json');
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
        baseDocument.copy(Ti.Filesystem.getApplicationDataDirectory()+'/config/config.json');
        
        this._json = JSON.parse(customDocument.read().toString());
        
    // Otherwise compare it to the base config to see if anything's missing
    } else {
        this._json = JSON.parse(customDocument.read().toString());
        
        var baseJson = JSON.parse(baseDocument.read().toString());
        var changes = false;
        // TODO: this method expects there to only be two levels of config, make it recursive
        for (var key in baseJson) {
            if (!this._json[key]) {
                this._json[key] = baseJson[key];
                changes = true;
                continue;
            }
            for (var subKey in baseJson[key]) {
                if (!this._json[key][subKey]) {
                    this._json[key][subKey] = baseJson[key][subKey];
                    changes = true;
                }
            }
        }
        
        if (changes) {
            customDocument.write(JSON.stringify(this._json));
        }
    }
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
        if (!$('#urlBase').val().match(/^http(s)?:\/\/.+$/)) {
            errors.push('\''+$('#urlBase').val()+'\' does not appear to be a valid URL (make sure it starts http(s))');
        }
        if ($('#username').val() == '') {
            errors.push('Username cannot be blank');
        }
        if ($('#password').val() == '') {
            errors.push('Password cannot be blank');
        }

        if (errors.length > 0) {
            App.alertUser(errors.join('\n'));
            return false;
        }

        // No errors, update the config
        $('input', this).each(function() {
            var name = $(this).attr('name');
            var val = $(this).val();
            if (name == 'password') {
                // Obfuscate the password
                // Not great but its only stored locally so not a big security risk
                val = $.base64.encode(val);
            }
            config.set(name, val);
        });
        config.save();

        // Done, ask the App to route
        App.getInstance().load();

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
    if (!App) {
        throw 'Config cannot function without App';
    }
    
    this._loadJson();
    this._registerFormListener();
};

/**
 * Check if the config is ready
 * 
 * @return Boolean
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
        if (this._json.jira[key] && $('#'+key).length == 1) {
            $('#'+key).val(this.get(key));
        }
    }
}

/**
 * Get a config option
 * 
 * @param String attribute
 * @returns String
 * @public
 */
Config.prototype.get = function(attribute)
{
    if (!this._json.jira[attribute]) {
        throw 'Unknown config requested: '+attribute;
    }

    var val = this._json.jira[attribute];
    if (attribute == 'password') {
        val = $.base64.decode(val);
    }

    return val;
};

/**
 * Set a config option
 * 
 * @param String attribute
 * @param String value
 * @public
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
    customDocument.open(Ti.Filesystem.MODE_WRITE);
    customDocument.write(JSON.stringify(this._json));
};