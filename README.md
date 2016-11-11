# Watcher Require

[![npm](https://img.shields.io/npm/v/watcher-require.svg)](https://www.npmjs.com/package/watcher-require) [![npm](https://img.shields.io/npm/dm/watcher-require.svg)](https://www.npmjs.com/package/watcher-require)

With this module you will receive a callback when a module or its dependencies are modified.

To receive a callback for any non-native dependecies an specific module loads, see https://github.com/Llorx/custom-require

To always receive an updated version of your modules, checking files and dependencies modifications,see https://github.com/Llorx/updated-require

## Installation

`npm install watcher-require`

## Usage

```js
/* FILE: test1.js */
// Load any non-native module
require("react");
```

```js
/* FILE: test2.js */
// Load any non-native module
require("react");
require("redux");
```

```js
/* FILE: main.js */
// Load the module at the top of the entry point file
var WatcherRequire = require("watcher-require").WatcherRequire;

// If you are using TypeScript, you can use import
import { WatcherRequire } from "watcher-require";

// Instantiate an object with a callback that will be called with all the new changes
var watcherRequire = new WatcherRequire(function(changes) {
    console.log("Something has changed! decache and reload!");
    console.log(changes.add, changes.changed, changes.unlink);
}, {
    delay: 300, // The callback will not be called instantly. You will receive one callback per each bunch of files changed
    persistent: true // Keep the process open, watching files
});

// Require a module to start watching
watcherRequire.require("./test");

// You can also require another file to watch
watcherRequire.require("./test2");

// You can create different Watcher Require instances together in the same script
var secondWatcher = new WatcherRequire(function() {
    console.log("Second watcher");
});

// Requiring modules already required by another instance will not be a problem
// Second watcher will receive all the dependencies too
// The require method will work as the default require one, returning the exports contents
var yay = secondWatcher.require("./test");

// Yay it
console.log(yay);

// After you have finished, call dispose() to clean resources attached to modules
watcherRequire.dispose();
secondWatcher.dispose();
```

Also, it works with asynchronous requires
```js
/* FILE: async_test.js */
// Load any non-native module
require("react");
setTimeout(function() {
    require("redux");
}, 1000);
```

## Limitations

See Custom Require limitations: https://github.com/Llorx/custom-require#limitations