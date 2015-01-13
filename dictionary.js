"use strict";

var wrapper = function(){
  var dictionaries = {};
  var Dictionary = function Dictionary(languages, defaultLanguage){
    languages = languages || {};
    defaultLanguage = defaultLanguage || "en";
    
    this.getLanguages = function(){
      var hash, rg = [];
      for(hash in languages) rg.push(hash);
      return rg;
    };
    this.getLanguage = function(language){
      return languages[language] || (languages[language] = {});
    };
    this.setLanguage = function(language, dict){
      languages[language] = dict;
    };
    this.setDefaultLanguage = function(language){
      defaultLanguage = language;
      return this;
    };
    this.getDefaultLanguage = function(){
      return defaultLanguage;
    };
    this.getDefaultLanguagePack = function(){
      return languages[defaultLanguage];
    };
  };
  
  Dictionary.get = function(name){
    return dictionaries[name];
  };
  Dictionary.create = function(name, languagePack, defaultLanguage){
    if(name in dictionaries) throw new Error("There is already a dictionary with the name '" + name + "'!");
    dictionaries[name] = new Dictionary(languagePack, defaultLanguage);
    return dictionaries[name];
  };
  Dictionary.remove = function(name){
    delete dictionaries[name];
  };
  return Dictionary;
};

module.exports = wrapper();
module.exports.wrapper = wrapper;