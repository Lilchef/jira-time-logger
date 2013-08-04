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
    /**
     * @type Object
     * @private
     */
    var json = {};
    /**
     * @type Array
     * @private
     */
    var requiredConfigs = ["urlBase", "urlApi", "username", "password"];
    /**
     * @type Array
     * @private
     */
    var submitListeners = [];
    
    /**
     * Get the config JSON
     * 
     * @returns Object
     * @public
     */
    this.getJson = function()
    {
        return json;
    };
    
    /**
     * Set the config JSON
     * 
     * @param Object newJson
     * @public
     */
    this.setJson = function(newJson)
    {
        json = newJson;
        return this;
    };
    
    /**
     * Get the config options that are required
     * 
     * @returns Array
     * @public
     */
    this.getRequiredConfigs = function()
    {
        return requiredConfigs;
    };
    
    /**
     * Get submit listeners
     * 
     * @return Array
     * @public
     */
    this.getSubmitListeners = function()
    {
        return submitListeners;
    };
    
    /**
     * Add a submit listener
     * 
     * @param function listener
     * @public
     */
    this.addSubmitListener = function(listener)
    {
        submitListeners.push(listener);
        return this;
    };
}

/*
 * Static variables and functions
 */

/**
 * Alert the user to something (intrusive)
 * 
 * @param String message
 * @static
 */
Config.alertUser = function(message) {
    alert(message);
};

/*
 * Instance public methods
 */

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
 * @return Boolean
 * @public
 */
Config.prototype.ready = function()
{
    var requiredConfigs = this.getRequiredConfigs();
    var json = this.getJson();
    for (var key in requiredConfigs) {
        if (!json.jira[requiredConfigs[key]]) {
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
    var json = this.getJson();
    for (var key in json.jira) {
        if (json.jira[key] && $('#'+key).length == 1) {
            var val = this.get(key);
            if (val instanceof Array) {
                val = val.join(', ');
            }
            $('#'+key).val(val);
        }
    }
};

/**
 * Register a listener for when the config page has been submitted
 * 
 * @param Function listener
 * @throws Exception if something other than a Function is passed in
 * @public
 */
Config.prototype.registerSubmitListener = function(listener)
{
    if (!(listener instanceof Function)) {
        throw "Invalid argument: Config.registerSubmitListener() requires a callable function";
    }
    
    this.addSubmitListener(listener);
};

/**
 * Get a config option
 * 
 * @param String attribute
 * @param String section
 * @returns String
 * @public
 */
Config.prototype.get = function(attribute, section)
{
    section = (section) ? section : 'jira';
    
    var json = this.getJson();
    if (!json[section] || !json[section][attribute]) {
        throw 'Unknown config requested: '+section+':'+attribute;
    }

    var val = json[section][attribute];
    // If its password that's been requested decode it
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
 * @param String section
 * @public
 */
Config.prototype.set = function(attribute, value, section)
{
    section = (section) ? section : 'jira';
    var json = this.getJson();
    json[section][attribute] = value;
    this.setJson(json);
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
    customDocument.write(JSON.stringify(this.getJson()));
};

/*
 * Instance protected methods
 * No such thing in JavaScript, it's just conceptual
 */

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
        
        this.setJson(JSON.parse(customDocument.read().toString()));
        
    // Otherwise compare it to the base config to see if anything's missing
    } else {
        var json = JSON.parse(customDocument.read().toString());
        
        var baseJson = JSON.parse(baseDocument.read().toString());
        var changes = false;
        // TODO: this method expects there to only be two levels of config, make it recursive
        for (var key in baseJson) {
            if (!json[key]) {
                json[key] = baseJson[key];
                changes = true;
                continue;
            }
            for (var subKey in baseJson[key]) {
                if (!json[key][subKey]) {
                    json[key][subKey] = baseJson[key][subKey];
                    changes = true;
                }
            }
        }
        
        this.setJson(json);
        if (changes) {
            customDocument.write(JSON.stringify(this.getJson()));
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
        $('#configForm li.warning').removeClass('warning');
        var errors = [];
        if (!$('#urlBase').val().match(/^http(s)?:\/\/.+$/)) {
            $('#urlBase').parent().addClass('warning');
            errors.push('\''+$('#urlBase').val()+'\' does not appear to be a valid URL (make sure it starts http(s))');
        }
        if ($('#username').val() == '') {
            $('#username').parent().addClass('warning');
            errors.push('Username cannot be blank');
        }
        if ($('#password').val() == '') {
            $('#password').parent().addClass('warning');
            errors.push('Password cannot be blank');
        }

        if (errors.length > 0) {
            Config.alertUser(errors.join('\n'));
            return false;
        }

        // No errors, update the config
        $('input, select, textarea', this).each(function() {
            var name = $(this).attr('name');
            var val = $(this).val();
            if (!name) {
                return true;
            }
            switch (name) {
                case 'password':
                    // Obfuscate the password
                    // Not great but its only stored locally so not a big security risk
                    val = $.base64.encode(val);
                    break;
                case 'subTaskTypeExclusions':
                    val = val.replace(/,\s+/g, ',').split(',');
                    break;
            }
            config.set(name, val);
        });
        config.save();

        // Done, notify listeners
        var submitListeners = config.getSubmitListeners();
        if (submitListeners.length > 0) {
            for (var count = 0; count < submitListeners.length; count++) {
                var listener = submitListeners[count];
                listener();
            }
        }

        // Prevent regular form submission
        return false;
    });
};