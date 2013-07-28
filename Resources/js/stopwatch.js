/**
 * stopwatch.js file
 * 
 * Contains the Stopwatch class.
 * 
 * @author Aaron Baker <me@aaronbaker.co.uk>
 * @copyright Aaron Baker 2013
 */

/**
 * Stopwatch class
 * 
 * @constructor
 */
function Stopwatch()
{
    this.reset();
}

/*
 * Instances variables
 */

/**
 * @type Object
 */
Stopwatch.prototype._time = null;

/**
 * @type Integer
 */
Stopwatch.prototype._interval = null;

/**
 * @type Array
 */
Stopwatch.prototype._secListeners = [];
/**
 * @type Array
 */
Stopwatch.prototype._minListeners = [];
/**
 * @type Array
 */
Stopwatch.prototype._hourListeners = [];

/*
 * Instances public methods
 */

/**
 * Register a listener for when a second ticks over
 * 
 * @param Function listener Will be passed the elapsed time from getTime()
 * @throws Exception if something other than a Function is passed in
 * @public
 */
Stopwatch.prototype.registerSecListener = function(listener)
{
    if (!(listener instanceof Function)) {
        throw "Invalid argument: Stopwatch.registerSecListener() requires a callable function";
    }
    
    this._secListeners.push(listener);
};

/**
 * Register a listener for when a minute ticks over
 * 
 * @param Function listener Will be passed the elapsed time from getTime()
 * @throws Exception if something other than a Function is passed in
 * @public
 */
Stopwatch.prototype.registerMinListener = function(listener)
{
    if (!(listener instanceof Function)) {
        throw "Invalid argument: Stopwatch.registerMinListener() requires a callable function";
    }
    
    this._minListeners.push(listener);
};

/**
 * Register a listener for when a hour ticks over
 * 
 * @param Function listener Will be passed the elapsed time from getTime()
 * @throws Exception if something other than a Function is passed in
 * @public
 */
Stopwatch.prototype.registerHourListener = function(listener)
{
    if (!(listener instanceof Function)) {
        throw "Invalid argument: Stopwatch.registerHourListener() requires a callable function";
    }
    
    this._hourListeners.push(listener);
};

/**
 * Start the clock
 * 
 * @return Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.start = function()
{
    if (this._interval) {
        return this;
    }
    if (!this._time.sec) {
        this.reset();
    }
    var self = this;
    this._interval = setInterval(function ()
    {
        return self._tick();
    },
    1000);
        
    return this;
};

/**
 * Stop the clock
 * 
 * @param Boolean reset (Optional) Reset the time?
 * @return Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.stop = function(reset)
{
    if (!this._interval) {
        return this;
    }
    clearInterval(this._interval);
    this._interval = null;
    if (reset) {
        this.reset();
    }
    
    return this;
};

/**
 * Reset the clock
 * 
 * @return Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.reset = function()
{
    this._time = {
        "sec": 0,
        "min": 0,
        "hour": 0
    };
    
    return this;
};

/**
 * Restart the stopwatch
 * 
 * Helper method
 * 
 * @return Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.restart = function()
{
    this.stop(true).start();
    
    return this;
};

/**
 * Get the elapsed time
 * 
 * @param String (Optional) Either hour or min to round to the nearest of
 * @return Object sec, min, hour
 * @public
 */
Stopwatch.prototype.getTime = function(round)
{
    var time = this._time;
    if (round) {
        time = this.roundTime(time, round);
    }
    return time;
};

/**
 * Round a time to the nearest minute or hour
 * 
 * @param Object time hour, min, sec
 * @param String Either hour or min (or nothing) to round to the nearest of
 * @returns Object Modified time
 */
Stopwatch.prototype.roundTime = function(time, round)
{
    if (round == 'min') {
        var currSec = time.sec;
        time.sec = 0;
        if (currSec >= 30) {
            time.min++;
            if (time.min == 60) {
                time.min = 0;
                time.hour++;
            }
        }
    } else if (round == 'hour') {
        var currMin = time.min;
        time.min = 0;
        if (currMin >= 30) {
            time.hour++;
        }
    }
    
    return time;
};

/*
 * Instances private methods
 */

/**
 * Tick over a second
 * 
 * @private
 */
Stopwatch.prototype._tick = function()
{
    var secChanged = false;
    var minChanged = false;
    var hourChanged = false;
    
    // Seconds
    this._time.sec++;
    secChanged = true;
    
    // Minutes
    if (this._time.sec == 60) {
        this._time.sec = 0;
        this._time.min++;
        minChanged = true;
    }
    
    // Hours
    if (this._time.min == 60) {
        this._time.min = 0;
        this._time.hour++;
        hourChanged = true;
    }
    
    // Listeners
    if (secChanged && this._secListeners.length > 0) {
        for (var count in this._secListeners) {
            var listener = this._secListeners[count];
            listener(this.getTime());
        }
    }
    if (minChanged && this._minListeners.length > 0) {
        for (var count in this._minListeners) {
            var listener = this._minListeners[count];
            listener(this.getTime());
        }
    }
    if (hourChanged && this._hourListeners.length > 0) {
        for (var count in this._hourListeners) {
            var listener = this._hourListeners[count];
            listener(this.getTime());
        }
    }
};