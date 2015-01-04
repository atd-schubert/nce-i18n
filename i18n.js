"use strict";

var Dictionary = require("./dictionary");
var Translator = require("./translator");

module.exports = function(cms){
  if(!cms) throw new Error("You have to specify the cms object");
  
//# Mandantory Setup:
  var ext = cms.createExtension({package: require("./package.json")});
  
  ext.on("install", function(event){ // set options, but don't run or make available in cms
    //# Seting extension-config:
    //ext.config.route = ext.config.route || "/"+ext.name;
    ext.config.logger = ext.config.logger || {};
    ext.config.fallbackLanguage = ext.config.fallbackLanguage || "en";

    //# Declarations and settings:
    ext.logger = cms.getExtension("winston").createLogger(ext.name, ext.config.logger);
  });
  
  ext.on("uninstall", function(event){ // undo installation
    //# Undeclare:
    cms.getExtension("winston").removeLogger(ext.name);
    delete ext.logger;
  });
  
  ext.on("activate", function(event){ // don't set options, just run, make available in cms or register.
	  if(cms.requestMiddlewares.indexOf(router) === -1) {
		  cms.requestMiddlewares.push(router);
	  }
  });
  
  ext.on("deactivate", function(event){ // undo activation
	  if(cms.requestMiddlewares.indexOf(router) !== -1) {
		  cms.requestMiddlewares.splice(cms.requestMiddlewares.indexOf(router), 1);
	  }
  });
  
//# Private declarations:
  var router = function(req, res, next){
    
    // get settings in this order: session / user / browser-settings / defaults
    var tl;
    
    if(req.session && req.session.targetLanguage) tl = req.session.targetLanguage;
    else if(req.user && req.user.additional && req.user.additional.targetLanguage) tl = req.user.additional.targetLanguage;
    else if(req.headers && req.headers["accept-language"]) tl = req.headers["accept-language"];
    else tl = ext.config.fallbackLanguage;
    
    req.translator = new Translator({targetLanguage: tl});
    
    // Write to session if there is one
    if(req.session) req.session.targetLanguage = tl;
    return next();
  };

//# Public declarations and exports:
  ext.createDictionary = function(name, dict, defaultLang){
    return Dictionary.create.apply(Dictionary, arguments);
  };
  ext.removeDictionary = function(name){
    return Dictionary.remove.apply(Dictionary, arguments);
  };
  ext.getDictionary = function(name){
    return Dictionary.get.apply(Dictionary, arguments);
  };
  
  return ext;
}

module.exports.Dictionary = Dictionary;
module.exports.Translator = Translator;
