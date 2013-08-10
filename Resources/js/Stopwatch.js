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
    if (!StopwatchTime) {
        throw 'Stopwatch cannot function without StopwatchTime';
    }
    
    /**
     * @type StopwatchTime
     */
    var time = null;
    /**
     * @type Integer
     */
    var interval = null;
    /**
     * @type Array
     */
    var secListeners = [];
    /**
     * @type Array
     */
    var minListeners = [];
    /**
     * @type Array
     */
    var hourListeners = [];
    
    /**
     * Get the time
     * 
     * @returns StopwatchTime
     * @public
     */
    this.getTime = function()
    {
        return time;
    };
    
    /**
     * Set the time
     * 
     * @param StopwatchTime newTime
     * @public
     */
    this.setTime = function(newTime)
    {
        if (!(newTime instanceof StopwatchTime)) {
            throw 'Stopwatch.setTime called with non-StopwatchTime';
        }
        time = newTime;
        return this;
    };
    
    /**
     * Get the interval identifier
     * 
     * @returns Integer
     * @public
     */
    this.getInterval = function()
    {
        return interval;
    };
    
    /**
     * Set the interval identifier
     * 
     * @param Integer newInterval
     * @public
     */
    this.setInterval = function(newInterval)
    {
        interval = newInterval;
        return this;
    };
    
    /**
     * Clear the interval identifier
     * 
     * @public
     */
    this.clearInterval = function()
    {
        interval = null;
        return this;
    };
    
    /**
     * Get the second listeners
     * 
     * @returns Array
     * @public
     */
    this.getSecListeners = function()
    {
        return secListeners;
    };
    
    /**
     * Add a second listener
     * 
     * @param function
     * @public
     */
    this.addSecListener = function(listener)
    {
        if (!(listener instanceof Function)) {
            throw 'Stopwatch.addListener called with non-Function';
        }
        secListeners.push(listener);
        return this;
    };
    
    /**
     * Check if there are some second listeners
     * 
     * @returns Boolean
     * @public
     */
    this.hasSecListeners = function()
    {
        return (secListeners.length > 0);
    };
    
    /**
     * Get the minute listeners
     * 
     * @returns Array
     * @public
     */
    this.getMinListeners = function()
    {
        return minListeners;
    };
    
    /**
     * Add a minute listener
     * 
     * @param function
     * @public
     */
    this.addMinListener = function(listener)
    {
        if (!(listener instanceof Function)) {
            throw 'Stopwatch.addListener called with non-Function';
        }
        minListeners.push(listener);
        return this;
    };
    
    /**
     * Check if there are some minute listeners
     * 
     * @returns Boolean
     * @public
     */
    this.hasMinListeners = function()
    {
        return (minListeners.length > 0);
    };
    
    /**
     * Get the hour listeners
     * 
     * @returns Array
     * @public
     */
    this.getHourListeners = function()
    {
        return hourListeners;
    };
    
    /**
     * Add a hour listener
     * 
     * @param function
     * @public
     */
    this.addHourListener = function(listener)
    {
        if (!(listener instanceof Function)) {
            throw 'Stopwatch.addListener called with non-Function';
        }
        hourListeners.push(listener);
        return this;
    };
    
    /**
     * Check if there are some hour listeners
     * 
     * @returns Boolean
     * @public
     */
    this.hasHourListeners = function()
    {
        return (hourListeners.length > 0);
    };
    
    this.reset();
}

/*
 * Instances public methods
 */

/**
 * Start the clock
 * 
 * @return Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.start = function()
{
    if (this.getInterval()) {
        return this;
    }
    if (!this.getTime().sec) {
        this.reset();
    }
    var self = this;
    var interval = setInterval(function ()
    {
        return self._tick();
    },
    1000);
    this.setInterval(interval);
        
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
    if (!this.getInterval()) {
        return this;
    }
    clearInterval(this.getInterval());
    this.clearInterval();
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
    var time = new StopwatchTime();
    this.setTime(time);
    
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
    var time = this.getTime();
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

/**
 * Deduct some time from the elapsed time
 * 
 * @param Object time hour, min, sec
 * @returns Stopwatch Fluent interface
 * @public
 */
Stopwatch.prototype.deductTime = function(time)
{
    var currTime = this.getTime();
    var secChanged = false;
    var minChanged = false;
    var hourChanged = false;
    
    if (time.sec) {
        currTime.sec -= time.sec;
        secChanged = true;
        
        if (currTime.sec < 0) {
            if (currTime.min > 0) {
                currTime.sec += 60;
                currTime.min--;
                minChanged = true;
            } else {
                currTime.sec = 0;
            }
        }
    }
    if (time.min) {
        currTime.min -= time.min;
        minChanged = true;
        
        if (currTime.min < 0) {
            if (currTime.hour > 0) {
                currTime.min += 60;
                currTime.hour--;
                hourChanged = true;
            } else {
                currTime.min = 0;
            }
        }        
    }
    if (time.hour) {
        currTime.hour -= time.hour;
        hourChanged = true;
        
        if (currTime.hour < 0) {
            currTime.hour = 0;
        }
    }
    
    this.setTime(currTime);
    
    // Listeners
    if (secChanged) {
        this._notifySecListeners();
    }
    if (minChanged) {
        this._notifyMinListeners();
    }
    if (hourChanged) {
        this._notifyHourListeners();
    }
    
    return this;
};

/*
 * Instance protected methods
 * No such thing in JavaScript, it's just conceptual
 */

/**
 * Tick over a second
 * 
 * @private
 */
Stopwatch.prototype._tick = function()
{
    var currTime = this.getTime();
    var secChanged = false;
    var minChanged = false;
    var hourChanged = false;
    
    // Seconds
    currTime.sec++;
    secChanged = true;
    
    // Minutes
    if (currTime.sec == 60) {
        currTime.sec = 0;
        currTime.min++;
        minChanged = true;
    }
    
    // Hours
    if (currTime.min == 60) {
        currTime.min = 0;
        currTime.hour++;
        hourChanged = true;
    }
    
    this.setTime(currTime);
    
    // Listeners
    if (secChanged) {
        this._notifySecListeners();
    }
    if (minChanged) {
        this._notifyMinListeners();
    }
    if (hourChanged) {
        this._notifyHourListeners();
    }
};

/**
 * Notify listeners that the seconds have changed
 * 
 * @protected
 */
Stopwatch.prototype._notifySecListeners = function()
{
    if (this.hasSecListeners()) {
        var listeners = this.getSecListeners();
        for (var count in listeners) {
            var listener = listeners[count];
            listener(this.getTime());
        }
    }
};

/**
 * Notify listeners that the minutes have changed
 * 
 * @protected
 */
Stopwatch.prototype._notifyMinListeners = function()
{
    if (this.hasMinListeners()) {
        var listeners = this.getMinListeners();
        for (var count in listeners) {
            var listener = listeners[count];
            listener(this.getTime());
        }
    }
};

/**
 * Notify listeners that the hours have changed
 * 
 * @protected
 */
Stopwatch.prototype._notifyHourListeners = function()
{
    if (this.hasHourListeners()) {
        var listeners = this.getHourListeners();
        for (var count in listeners) {
            var listener = listeners[count];
            listener(this.getTime());
        }
    }
};