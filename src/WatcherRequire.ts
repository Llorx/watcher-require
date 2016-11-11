import { CustomRequire, CustomNodeModule } from "custom-require";

import * as fs from "fs";

var chokidar;
try {
    chokidar = require("chokidar");
} catch (e) {
}


export class Watcher {
    watcher:fs.FSWatcher;
    watchers:{[file:string]:fs.FSWatcher} = {};
    _events:{[event:string]:Function[]} = {};
    options:WatcherOptions;
    timeouts:{[filename:string]:any} = {};
    constructor(options?:WatcherOptions) {
        if (!options) {
            options = {};
        }
        if (chokidar) {
            this.watcher = chokidar.watch([], {
                persistent: options.persistent
            });
        } else {
            this.options = options;
        }
    }
    call(event:string, filename:string) {
        clearTimeout(this.timeouts[filename]);
        this.timeouts[filename] = setTimeout(() => {
            delete this.timeouts[filename];
            if (this._events[event]) {
                for(let callback of this._events[event]) {
                    callback(filename);
                }
            }
        }, 50);
    }
    checkFile(filename:string) {
        if (fs.existsSync(filename)) {
            this.call("change", filename);
        } else {
            this.call("unlink", filename);
        }
    }
    add(filename:string) {
        if (this.watcher) {
            this.watcher.add(filename);
        } else {
            filename = require.resolve(filename);
            if (!this.watchers[filename]) {
                this.call("add", filename);
                this.watchers[filename] = fs.watch(filename, {
                    persistent: this.options.persistent
                }, this.checkFile.bind(this, filename));
            }
        }
    }
    unwatch(filename:string) {
        if (this.watcher) {
            this.watcher.unwatch(filename);
        } else {
            filename = require.resolve(filename);
            if (this.watchers[filename]) {
                this.watchers[filename].close();
                delete this.watchers[filename];
            }
        }
    }
    on(event:string, callback:Function) {
        if (this.watcher) {
            this.watcher.on(event, callback);
        } else {
            if (!this._events[event]) {
                this._events[event] = [];
            }
            this._events[event].push(callback);
        }
    }
    close() {
        if (this.watcher) {
            this.watcher.close();
        } else {
            for (var i in this.watchers) {
                if (this.watchers.hasOwnProperty(i)) {
                    this.watchers[i].close();
                }
            }
            this.watchers = {};
            this._events = {};
        }
    }
}

export { CustomNodeModule };

export interface WatcherOptions {
    delay?:number;
    persistent?:boolean;
    methods?: {
        add:boolean,
        change:boolean,
        unlink:boolean,
    }
}

export interface WatcherCallback {
    add?:CustomNodeModule[];
    change?:CustomNodeModule[];
    unlink?:CustomNodeModule[];
}

export class WatcherRequire extends CustomRequire {
    _watcherOptions:WatcherOptions;
    _watcherCallback:(changes:WatcherCallback)=>void;
    _watcherTimeout:NodeJS.Timer = null;
    _watcher:Watcher;
    _watcherList:{[file:string]: CustomNodeModule} = {};
    _watcherDelayed:{[type:string]: string[]} = {};
    constructor(callback:(changes?:WatcherCallback)=>void, options?:WatcherOptions) {
        super((mod:CustomNodeModule) => {
            this._watcherList[mod.filename] = mod;
            this._watcher.add(mod.filename);
        }, (modlist:CustomNodeModule[]) => {
            for (let mod of modlist) {
                delete this._watcherList[mod.filename];
                this._watcher.unwatch(mod.filename);
            }
        });
        if (!options) {
            options = {
                delay: 300,
                persistent: true,
                methods: {
                    add: true,
                    change: true,
                    unlink: true
                }
            };
        }
        if (options.delay == null || !isFinite(options.delay)) {
            options.delay = 300;
        }
        if (!options.methods) {
            options.methods = {
                add: true,
                change: true,
                unlink: true
            }
        }
        this._watcher = new Watcher(options);
        for (var i in options.methods) {
            if (options.methods.hasOwnProperty(i) && options.methods[i]) {
                this._watcherDelayed[i] = [];
                this._watcher.on(i, this._watcherNotify.bind(this, i));
            }
        }
        this._watcherOptions = options;
        this._watcherCallback = callback;
    }
    _watcherNotify(method:string, path:string) {
        if (this._watcherDelayed[method].indexOf(path) < 0) {
            this._watcherDelayed[method].push(path);
        }
        if (this._watcherTimeout == null) {
            this._watcherTimeout = setTimeout(() => {
                this._watcherTimeout = null;
                var callback:WatcherCallback = {};
                for (var i in this._watcherOptions.methods) {
                    if (this._watcherOptions.methods.hasOwnProperty(i) && this._watcherOptions.methods[i]) {
                        callback[i] = this._watcherDelayed[i];
                        for (let ii = 0; ii < callback[i].length; ii++) {
                            callback[i][ii] = this._watcherList[callback[i][ii]];
                        }
                        this._watcherDelayed[i] = [];
                    }
                }
                this._watcherCallback(callback);
            }, this._watcherOptions.delay);
        }
    }
    dispose() {
        super.dispose();
        this._watcher.close();
        clearTimeout(this._watcherTimeout);
        this._watcherTimeout = null;
        this._watcherList = {};
        this._watcherDelayed = {};
    }
}