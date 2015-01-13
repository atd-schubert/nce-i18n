#i18n for nce
## Description
Internationalization (not only) for the [nce framework](https://github.com/atd-schubert/node-nce)

## How to install
Install with npm: `npm install --save nce-i18n`

Integrate in NCE:

```
var NCE = require("nce");
var nce = new NCE(/*{
  logger:{},
  fallbackLanguage: "en"
}*/);
var i18n = require("nce-i18n");
var ext = dummy(nce);
ext.install();
ext.activate();
```

Or use nce-extension-manager...

## Install standalone
```
var i18n = require("nce-i18n");

var dict = i18n.Dictionary.create("name", {de:{hello:"Hallo", vsprintf: "Hallo %s"},en:{hello:"Hello", vsprintf: "Hello %s"}});

var translator = new i18n.Translator({targetLanguage:"en"});
translator(dict, "hello");

// Concat with other functions:
translator(dict, "hello", console.log); // -> undefined but get a console.log of Hello
translator(dict, "hello", console.log, "this is the second parameter for console.log"); // -> undefined but get a console.log of "Hello" and "this is the second parameter for console.log"
translator(dict, "vsprintf", require("sprintf").vsprintf, "World"); // -> Hello World
```


## How to use
### Basic funcitons for dictionary
#### createDictionary(name, dict, defaultLanguage)
Create a new dictionary.
#### removeDictionary(name)
Remove a dictionary by its name.
#### getDictionary
Get a dictionary by its name.
### Basic funcitons for translator
#### __(dict, query, fn, args)
* First argument must be the dictionary or a dictionary name.
* The query should be a string with dot notation to query, or you are able to use different arguements as string
* The function (fn) is optional but must be a function!
* The arguments are optional and get passed to the function (fn). The result of the translation is the first argument!

##### Example
We have a dictionary called example with the following structure:
```
var ex = i18n.Dictionary.create("example", {
  en:{
    nested:{
      path: {
        for: {
          example: {
            string: "Result"
          }
        }
      },
      "path.for": {
        example: {
          string: "Another"
        }
      }
    }
  });
```
We are able to request the following ways:
```
translator.__("example", "nested.path.for.example.string"); // -> Result
translator.__(ex, "nested.path.for.example.string"); // -> Result
translator.__("example", "nested", "path", "for", "example", "string"); // -> Result
translator.__("example", "nested", "path.for", "example", "string"); // -> Another
translator.__("example", "nested", "path.for", "example.string"); // -> Another
translator.__("example", "nested", "path.for.example", "string"); // -> Result
```

We can use additional functions:

```
translator.__("example", "nested.path.for.example.string", console.log); // -> logs: Result
translator.__("example", "nested", "path.for", "example", "string" console.log); // -> logs: Another
translator.__("example", "nested", "path.for", "example.string", console.log, "example"); // -> logs: Another, example
translator.__("example", "nested", "path.for.example", "string", console.log, "works", "fine"); // -> logs: Result, works, fine
```
#### __n(dictionary, number, query, fn, args)
* First argument must be the dictionary or a dictionary name.
* The number of an element (1 is singular everything else is plural)
* The query should be a string with dot notation to query, or you are able to use different arguments as string
* The function (fn) is optional but must be a function!
* The arguments are optional and get passed to the function (fn). The result of the translation is the first argument!
##### Example
We have a dictionary called example with the following structure:
```
var n = i18n.Dictionary.create("enumeration", {
  en:{
    dog:{
      plural: "dogs",
      singular: "dog"
    }
  });
```
We are able to request the following ways:
```
translator.__n("enumeration", 1, "dog"); // -> dog
translator.__n(n, 1, "dog"); // -> dog
translator.__n(n, 2, "dog"); // -> dogs
```
Using functions and arguments for the function works the same way like using __!
#### __g(dictionary, gender, query, fn, args)
* First argument must be the dictionary or a dictionary name.
* The gender of an element (m is masculine, f is feminine)
* The query should be a string with dot notation to query, or you are able to use different arguments as string
* The function (fn) is optional but must be a function!
* The arguments are optional and get passed to the function (fn). The result of the translation is the first argument!
##### Example
We have a dictionary called example with the following structure:
```
var g = i18n.Dictionary.create("gender", {
  en:{
    dog:{
      feminine: "bitch",
      masculine: "dog"
    }
  });
```
We are able to request the following ways:
```
translator.__g("gender", "m", "dog"); // -> dog
translator.__g(g, "masculine", "dog"); // -> dog
translator.__g("gender", "f", "dog"); // -> bitch
translator.__g("gender", "feminine", "dog"); // -> bitch
```
Using functions and arguments for the function works the same way like using `__`!

## Integrate in NCE
### Config settings
You are able to use the following [config-settings](https://github.com/atd-schubert/node-nce/wiki/Extension-Class#configuration) (listed with their defaults):

* `fallbackLanguage: "en"`: Language to use, when no other requested language matches.
* `logger: {}`: Settings for [logger-extension](https://github.com/atd-schubert/nce-winston)

### Basic methods
#### ext.createDictionary = function(name, dict, defaultLang)
You can use this methods like described above in "dirctionary" section.
#### ext.removeDictionary = function(name)
You can use this methods like described above in "dirctionary" section.
#### ext.getDictionary = function(name)
You can use this methods like described above in "dirctionary" section.

### Use in a request-middleware.
* req.i18n.translator.__(dict, ... [fn], [arguments])
* req.i18n.translator.__n(dict, n, ... [fn], [arguments])
* req.i18n.translator.__g(dict, gender, ... [fn], [arguments])

You can use this methods like described above in "translator" section.

#### ext.dummy(name, cb, opts)
Dummy method.

##### Arguments
1. `name`[String]:
1. `cb`[Function]: Callback-function with the arguments:
    1. `error`[Error]: Used for exceptions
    1. `data`[Buffer]: Dummy-Data
    1. `result`[Object]: Result of the query
        * `content`[String]:
        * `query`[String]:
1. `opts`[Object]: Options: