"use strict";


var NCE = require("nce");
var ExtMgr = require("nce-extension-manager");
var Ext = require("../");
var Server = require("nce-server");

var sampleDict = {
  "de":{
    "ok":"Bereit",
    "nested": {
      "object":{
        "value":"Das ist ein Wert, der in einem Unterobjekt gespeichert wurde..."
      }
    },
    "dog": {
      "singular": "Hund",
      "plural": "Hunde",
      "masculine": "Rüde",
      "feminine": "Hündin"
    }
  },
  "en":{
    "ok":"OK",
    "nested": {
      "object":{
        "value":"This is a value from a nested object..."
      }
    },
    "dog": {
      "singular": "dog",
      "plural": "dogs",
      "masculine": "dog",
      "feminine": "bitch"
    }
  }
};

describe('Unit-tests for dictionary class', function(){
  var target = Ext.Dictionary;
  it('should set a sample dictionary.', function(done){
    var d = target.create("sample", sampleDict);
    if(d.getLanguage) return done();
    return done(new Error("Has not created a correct dictionary"));
  });
  it('should get the sample dictionary.', function(done){
    var d = target.get("sample");
    if(d.getLanguage) return done();
    return done(new Error("Has not created a correct dictionary"));
  });
  it('should not get another dictionary.', function(done){
    var d = target.get("another", sampleDict);
    if(d === undefined) return done();
    return done(new Error("Wrong dictionary"));
  });
  it('should not get a deleted dictionary.', function(done){
    target.create("delete");
    target.remove("delete");
    var d = target.get("delete");
    if(d === undefined) return done();
    return done(new Error("Dictionary was not deleted"));
  });
  
  it('should not get a deleted dictionary.', function(done){
    target.create("delete");
    target.remove("delete");
    var d = target.get("delete");
    if(d === undefined) return done();
    return done(new Error("Dictionary was not deleted"));
  });
});

describe('Unit-tests for dictionary objects', function(){
  var target = Ext.Dictionary;
  var empty = target.create("empty");
  
  
  it('should get an empty langage object on an empty dictionary.', function(done){
    var lang = empty.getLanguage("en");
    var hash;
    for (hash in lang) return done(new Error("This dictionary was not empty."));
    return done();
  });
  it('should set and get the dictionary by referance.', function(done){
    var lang = empty.getLanguage("en");
    lang.test = "It works";
    if(empty.getLanguage("en").test === "It works") return done();
    return done(new Error("Dictionary has not set the data correctly."));
  });
  it('should set a language pack.', function(done){
    empty.setLanguage("de", {test:"Es läuft"});
    if(empty.getLanguage("de").test === "Es läuft") return done();
    return done(new Error("Dictionary has not set the data correctly."));
  });
  it('should list all languages in a dictionary.', function(done){
    var langs = empty.getLanguages();
    if(langs.length === 2 && langs.indexOf("de")>=0 && langs.indexOf("en")>=0) return done();
    return done(new Error("Not the correct languges in dictionary."));
  });
  it('should set default language to "en" on default.', function(done){
    if(empty.getDefaultLanguage() === "en") return done();
    return done(new Error("Dictionary has a wrong default language."));
  });
  it('should set default language to another.', function(done){
    empty.setDefaultLanguage("de");
    if(empty.getDefaultLanguage() === "de") return done();
    return done(new Error("Dictionary has a wrong default language."));
  });
  it('should get the correct default language pack.', function(done){
    if(empty.getDefaultLanguagePack() === empty.getLanguage("de")) return done();
    return done(new Error("Dictionary has a wrong default language."));
  });
  
});

describe('Unit-tests for translator', function(){
  var target = Ext.Translator;
  var enT = new target({targetLanguage:"en"});
  var deT = new target({targetLanguage:"de"});
  var esT = new target({targetLanguage:"es"});
  var dict = Ext.Dictionary.create("test", sampleDict);
  
  it('should translate into the english language.', function(done){
    if(enT.__(dict, "ok") === "OK") return done();
    return done(new Error("Translation was not correct."));
  });
  it('should translate into the german language.', function(done){
    if(deT.__(dict, "ok") === "Bereit") return done();
    return done(new Error("Translation was not correct."));
  });
  it('should translate into the default language.', function(done){
    if(esT.__(dict, "ok") === "OK") return done();
    return done(new Error("Translation was not correct."));
  });
  it('should translate with dictionary as string of its name.', function(done){
    if(esT.__("test", "ok") === "OK") return done();
    return done(new Error("Translation was not correct."));
  });
  it('should query different ways on nested objects.', function(done){
    if(enT.__(dict, "nested.object.value") === enT.__(dict, "nested", "object.value") &&
      enT.__(dict, "nested", "object", "value") === enT.__(dict, "nested.object", "value")) return done();
    return done(new Error("A Problem with nested objects."));
  });
  it('should be able to execute a function after getting the right translation.', function(done){
    var cbFn = function(x){
      if(x === "This is a value from a nested object...") return done();
      return done(new Error("Incorrect arguemnt data for callback"));
    };
    enT.__(dict, "nested", "object", "value", cbFn);
  });
  it('should be able to execute a function after getting the right translation with arguments.', function(done){
    var ts = Date.now();
    var cbFn = function(x, y){
      if(x === "This is a value from a nested object..." && y === ts) return done();
      return done(new Error("Incorrect arguemnt data for callback"));
    };
    enT.__(dict, "nested", "object", "value", cbFn, ts);
  });
  it('should be able to determinate singular.', function(done){
    var cbFn = function(x){
      if(x === "dog") return done();
      return done(new Error("Wrong singular translation."));
    };
    enT.__n(dict, 1, "dog", cbFn);
  });
  it('should be able to determinate plural.', function(done){
    var cbFn = function(x){
      if(x === "dogs") return done();
      return done(new Error("Wrong plural translation."));
    };
    enT.__n(dict, 2, "dog", cbFn);
  });
  it('should be able to determinate masculinum.', function(done){
    var cbFn = function(x){
      if(x === "Rüde") return done();
      return done(new Error("Wrong masculinum translation."));
    };
    deT.__g(dict, "m", "dog", cbFn);
  });
  it('should be able to determinate femininum.', function(done){
    var cbFn = function(x){
      if(x === "bitch") return done();
      return done(new Error("Wrong femininum translation."));
    };
    enT.__g(dict, "f", "dog", cbFn);
  });
});

describe('Basic integration in NCE', function(){
  var nce = new NCE();
  
  it('should be insertable into NCE', function(done){
    var ext = Ext(nce);
    if(ext) return done();
    return done(new Error("Is not able to insert extension into NCE"));
  });
});

describe('Basic integration in NCE', function(){
  var nce = new NCE();
  var ext = Ext(nce);
  var extMgr = ExtMgr(nce);
  extMgr.activateExtension(extMgr);
  
  it('should be installable', function(done){
    if(extMgr.installExtension(ext)) return done();
    return done(new Error("Can not install extension"));
  });
  it('should be activatable', function(done){
    if(extMgr.activateExtension(ext)) return done();
    return done(new Error("Can not activate extension"));
  });
  it('should be deactivatable', function(done){
    if(ext.deactivate()) return done();
    return done(new Error("Can not deactivate extension"));
  });
  it('should be uninstallable', function(done){
    if(ext.uninstall()) return done();
    return done(new Error("Can not uninstall extension"));
  });
  
  it('should be installable again', function(done){
    if(ext.install()) return done();
    return done(new Error("Can not install extension"));
  });
  it('should be activatable again', function(done){
    if(ext.activate()) return done();
    return done(new Error("Can not activate extension"));
  });
  it('should be deactivatable again', function(done){
    if(ext.deactivate()) return done();
    return done(new Error("Can not deactivate extension"));
  });
  it('should be uninstallable again', function(done){
    if(ext.uninstall()) return done();
    return done(new Error("Can not uninstall extension"));
  });
});


describe('Use middleware to create a translator', function(){
  var nce = new NCE();
  var ext = Ext(nce);
  var extMgr = ExtMgr(nce);
  extMgr.activateExtension(extMgr);
  extMgr.activateExtension(ext);
  extMgr.getActivatedExtension("server");
  
  ext.createDictionary("example", sampleDict);
  
  return;
  // TODO: create additional tests
});
