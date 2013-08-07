/**
 * ActivityLog.js file
 * 
 * Contains the ActivityLog class.
 * 
 * @author Aaron Baker <me@aaronbaker.co.uk>
 * @copyright Aaron Baker 2013
 */

/**
 * ActivityLog class
 * 
 * @param Integer maxLogs The number of entries to log before removing the oldest
 * @constructor
 */
function ActivityLog(maxLogs)
{
    /**
     * @type Integer
     */
    var maxLogs = maxLogs;
    
    /**
     * Get the maximum number of log entries
     * 
     * @returns Integer
     */
    this.getMaxLogs = function()
    {
        return maxLogs;
    };
}

// Alias
var AL = ActivityLog;

/**
 * @constant
 */
AL.LOG_INFO = 'INFO';
/**
 * @constant
 */
AL.LOG_WARN = 'WARN';
/**
 * @constant
 */
AL.LOG_ERROR = 'ERROR';
/**
 * @constant
 */
AL.LOG_MAX_SUMMARY_LENGTH = 20;

/**
 * Log a message
 * 
 * @param String message
 * @param String level One of the AL.LOG_* constants
 * @public
 */
AL.prototype.log = function(message, level)
{
    message = message.replace(/\n/g, '; ');
    level = (level) ? level : AL.LOG_INFO;
    var colour = '';
    switch (level) {
        case AL.LOG_ERROR: 
            colour = '#b75b5b';
            break;
        case AL.LOG_WARN:
            colour = '#f6b83f';
            break;
        case AL.LOG_INFO:
            colour = '#5bb75b';
            break;
    }
    var now = new Date();
    var dateTimeLogged = now.toLocaleString();
    
    var userLog = $('<div class="userLog '+level.toLowerCase()+'" title="'+dateTimeLogged+'">'+level+': '+message+'</div>');
    $('#userLogContainer').prepend(userLog);
    userLog.css({backgroundColor: colour})
            .show()
            .animate({backgroundColor: 'none'}, 1500);
    if ($('.userLog').length > this.getMaxLogs()) {
        $('#userLogContainer div:last-child').remove();
    }
};

/**
 * Log an info level message
 * 
 * Helper method
 * 
 * @param String message
 * @public
 */
AL.prototype.info = function(message)
{
    this.log(message, AL.LOG_INFO);
};

/**
 * Log an warn level message
 * 
 * Helper method
 * 
 * @param String message
 * @public
 */
AL.prototype.warn = function(message)
{
    this.log(message, AL.LOG_WARN);
};

/**
 * Log an error level message
 * 
 * Helper method
 * 
 * @param String message
 * @public
 */
AL.prototype.error = function(message)
{
    this.log(message, AL.LOG_ERROR);
};