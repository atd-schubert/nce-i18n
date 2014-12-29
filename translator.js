"use strict";

var Dictionary = require("./dictionary");

var parseAcceptedLanguage = function(lang){
  lang = lang.split(/, ?/);
  var i, tmp, hash;
  var obj = {};
  for(i=0; i<lang.length; i++) {
    tmp = lang[i].split(/; ?q=/);
    if(tmp.length >1) obj[tmp[0]] = parseFloat(tmp[1]);
    else obj[tmp[0]] = 1;
  }
  
  for (hash in obj) {
    if(hash.indexOf("-")>=0) {
      var tmp = hash.split("-")[0];
      obj[tmp] = obj[tmp] || obj[hash]-0.1;
    } 
  }
  
  return obj;
};

var getAcceptedLanguage = function(lang, list, fallbackLang){
  var bestLang = fallbackLang || "en";
  var points = 0;
  var hash;
  
  var langObj = parseAcceptedLanguage(lang);
  for (hash in langObj) if(list.indexOf(hash)>=0 && langObj[hash]>points) {
    bestLang = hash;
    points = langObj[hash];
    if(points === 1) return bestLang;
  }
  return bestLang;
};

var splitArguments = function(argumentsArray, start, cb){
  cb = cb || function(x){return x};
  start = start || 0;
  var args = [];
  var cbArgs = [];
  var i, n;
  for(i=start; i<argumentsArray.length; i++) {
    if(typeof argumentsArray[i] === "function") {
      cb = argumentsArray[i];
      for(n=i+1; n<argumentsArray.length; n++) {
        cbArgs.push(argumentsArray[n]);
      }
      break;
    }
    args.push(argumentsArray[i]);
  };
  return {
    cb: cb,
    args: args,
    cbArgs: cbArgs
  };
};

var objPath = function(obj, path){
  if(obj === null) return null;
  if(arguments.length>2) {
    var i;
    for (i=1; i<arguments.length; i++) {
      obj = objPath(obj, arguments[i]);
    }
    return obj;
  }
  if(obj[path]) return obj[path];
  
  var path = path.split(".");
  if(path.length>1) {
    if(obj[path[0]]) {
      obj = obj[path[0]];
      path[0] = "";
      path = path.join(".").substr(1);
      
      return objPath(obj, path);
    }
  }
  
  return null;
};

var Translator = function(opts){
  opts = opts || {};
  opts.targetLanguage = opts.targetLanguage || "en-US,en;q=0.8";
  //opts.fallbackLanguage = opts.fallbackLanguage || "en";
  opts.currency = opts.currency || "€";
  
  
  this.loadDefaultsFor = function(languageCode){
    // TODO: 
  };
  this.setTargetLanguage = function(languageCode){
    opts.targetLanguage = languageCode;
  };
  this.getTargetLanguage = function(){
    return opts.targetLanguage;
  };
  
  this.__ = function(dictionary /*, path*/){
    if(arguments.length === 1 && Date.prototype.isPrototypeOf(arguments[0])) {
      // TODO:
    };
    if(typeof dictionary === "string") dictionary = Dictionary.get(dictionary);
    if(arguments.length <2) throw new Error("Missing arguments");
    var lang = getAcceptedLanguage(opts.targetLanguage, dictionary.getLanguages(), dictionary.getDefaultLanguage());
    var entry = dictionary.getLanguage(lang);
    var splitedArgs = splitArguments(arguments, 1, function(x){return x;});
    
    splitedArgs.args.unshift(entry);
    
    entry = objPath.apply(this, splitedArgs.args);
    if(entry === null) {// try default language
      entry = dictionary.getDefaultLanguagePack();
      
      splitedArgs.args.shift();
      splitedArgs.args.unshift(entry);
      entry = objPath.apply(this, splitedArgs.args);
    }
    
    splitedArgs.cbArgs.unshift(entry);
    return splitedArgs.cb.apply(this, splitedArgs.cbArgs);
  };
  this.__n = function(dictionary, n /*, path*/){
    if(arguments.length <3) throw new Error("Missing arguments");
    
    var splitedArgs = splitArguments(arguments, 2, function(x){return x;});
    splitedArgs.args.unshift(dictionary);
    var entry = this.__.apply(this, splitedArgs.args);
    
    if(n===1) entry = entry.singular || null;
    else entry = entry.plural || null;
    
    splitedArgs.cbArgs.unshift(entry);
    return splitedArgs.cb.apply(this, splitedArgs.cbArgs);
  };
  this.__g = function(dictionary, gender /*, path*/){
    gender = gender.toLowerCase();
    if(arguments.length <3) throw new Error("Missing arguments");
    
    var splitedArgs = splitArguments(arguments, 2, function(x){return x;});
    splitedArgs.args.unshift(dictionary);
    var entry = this.__.apply(this, splitedArgs.args);
    
    if(gender === "masculine" || gender === "m") entry = entry.masculine || null;
    else if(gender === "feminine" || gender === "f") entry = entry.feminine || null;
    else entry = null;
    splitedArgs.cbArgs.unshift(entry);
    return splitedArgs.cb.apply(this, splitedArgs.cbArgs);
  };
  /* this.date = function(date){
    
        // Formats time according to the directives in the given format string.
  // The directives begins with a percent (%) character. Any text not listed as a
  // directive will be passed through to the output string.
  //
  // The accepted formats are:
  //
  //     %a  - The abbreviated weekday name (Sun)
  //     %A  - The full weekday name (Sunday)
  //     %b  - The abbreviated month name (Jan)
  //     %B  - The full month name (January)
  //     %c  - The preferred local date and time representation
  //     %d  - Day of the month (01..31)
  //     %-d - Day of the month (1..31)
  //     %H  - Hour of the day, 24-hour clock (00..23)
  //     %-H - Hour of the day, 24-hour clock (0..23)
  //     %I  - Hour of the day, 12-hour clock (01..12)
  //     %-I - Hour of the day, 12-hour clock (1..12)
  //     %m  - Month of the year (01..12)
  //     %-m - Month of the year (1..12)
  //     %M  - Minute of the hour (00..59)
  //     %-M - Minute of the hour (0..59)
  //     %p  - Meridian indicator (AM  or  PM)
  //     %S  - Second of the minute (00..60)
  //     %-S - Second of the minute (0..60)
  //     %w  - Day of the week (Sunday is 0, 0..6)
  //     %y  - Year without a century (00..99)
  //     %-y - Year without a century (0..99)
  //     %Y  - Year with century
  //     %z  - Timezone offset (+0545)
  //
  I18n.strftime = function(date, format) {
    var options = this.lookup("date")
      , meridianOptions = I18n.meridian()
    ;

    if (!options) {
      options = {};
    }

    options = this.prepareOptions(options, DATE);

    var weekDay = date.getDay()
      , day = date.getDate()
      , year = date.getFullYear()
      , month = date.getMonth() + 1
      , hour = date.getHours()
      , hour12 = hour
      , meridian = hour > 11 ? 1 : 0
      , secs = date.getSeconds()
      , mins = date.getMinutes()
      , offset = date.getTimezoneOffset()
      , absOffsetHours = Math.floor(Math.abs(offset / 60))
      , absOffsetMinutes = Math.abs(offset) - (absOffsetHours * 60)
      , timezoneoffset = (offset > 0 ? "-" : "+") +
          (absOffsetHours.toString().length < 2 ? "0" + absOffsetHours : absOffsetHours) +
          (absOffsetMinutes.toString().length < 2 ? "0" + absOffsetMinutes : absOffsetMinutes)
    ;

    if (hour12 > 12) {
      hour12 = hour12 - 12;
    } else if (hour12 === 0) {
      hour12 = 12;
    }

    format = format.replace("%a", options.abbr_day_names[weekDay]);
    format = format.replace("%A", options.day_names[weekDay]);
    format = format.replace("%b", options.abbr_month_names[month]);
    format = format.replace("%B", options.month_names[month]);
    format = format.replace("%d", padding(day));
    format = format.replace("%e", day);
    format = format.replace("%-d", day);
    format = format.replace("%H", padding(hour));
    format = format.replace("%-H", hour);
    format = format.replace("%I", padding(hour12));
    format = format.replace("%-I", hour12);
    format = format.replace("%m", padding(month));
    format = format.replace("%-m", month);
    format = format.replace("%M", padding(mins));
    format = format.replace("%-M", mins);
    format = format.replace("%p", meridianOptions[meridian]);
    format = format.replace("%S", padding(secs));
    format = format.replace("%-S", secs);
    format = format.replace("%w", weekDay);
    format = format.replace("%y", padding(year));
    format = format.replace("%-y", padding(year).replace(/^0+/, ""));
    format = format.replace("%Y", year);
    format = format.replace("%z", timezoneoffset);
  };*/  
};

module.exports = Translator;