import { CustomRequire } from "custom-require";
import * as chokidar from "chokidar";
import { FSWatcher } from "fs";

export interface WatcherOptions {
    delay?:number;
    persistent?:boolean;
}

export interface WatcherCallback {
    add?:NodeModule[];
    change?:NodeModule[];
    unlink?:NodeModule[];
}

export class WatcherRequire extends CustomRequire {
    _watcherOptions:WatcherOptions;
    _watcherCallback:(changes:WatcherCallback)=>void;
    _watcherTimeout:NodeJS.Timer = null;
    _watcher:FSWatcher;
    _watcherList:{[file:string]: NodeModule} = {};
    _watcherMethods = ["add", "change", "unlink"];
    _watcherDelayed:{[type:string]: NodeModule[]} = {};
    constructor(callback:(changes?:WatcherCallback)=>void, options?:WatcherOptions) {
        super((mod:NodeModule) => {
            this._watcherList[mod.filename] = mod;
            this._watcher.add(mod.filename);
        });
        if (!options) {
            options = {
                delay: 300,
                persistent: true
            };
        } else if (options.delay == null || !isFinite(options.delay)) {
            options.delay = 300;
        }
        this._watcher = chokidar.watch([], {
            persistent: options.persistent
        });
        for (var i = 0; i < this._watcherMethods.length; i++) {
            this._watcherDelayed[this._watcherMethods[i]] = [];
            this._watcher.on(this._watcherMethods[i], this._watcherNotify.bind(this, this._watcherMethods[i]));
        }
        this._watcherOptions = options;
        this._watcherCallback = callback;
    }
    _watcherNotify(method:string, path:string) {
        var mod = this._watcherList[path];
        if (this._watcherDelayed[method].indexOf(mod) < 0) {
            this._watcherDelayed[method].push(mod);
        }
        if (this._watcherTimeout == null) {
            this._watcherTimeout = setTimeout(() => {
                this._watcherTimeout = null;
                var callback:WatcherCallback = {};
                for (var i = 0; i < this._watcherMethods.length; i++) {
                    callback[this._watcherMethods[i]] = this._watcherDelayed[this._watcherMethods[i]];
                    this._watcherDelayed[this._watcherMethods[i]] = [];
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