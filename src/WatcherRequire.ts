import { CustomRequire, CustomNodeModule } from "custom-require";
import * as chokidar from "chokidar";
import { FSWatcher } from "fs";

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
    _watcher:FSWatcher;
    _watcherList:{[file:string]: CustomNodeModule} = {};
    _watcherDelayed:{[type:string]: CustomNodeModule[]} = {};
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
        this._watcher = chokidar.watch([], {
            persistent: options.persistent
        });
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
        var mod = this._watcherList[path];
        if (this._watcherDelayed[method].indexOf(mod) < 0) {
            this._watcherDelayed[method].push(mod);
        }
        if (this._watcherTimeout == null) {
            this._watcherTimeout = setTimeout(() => {
                this._watcherTimeout = null;
                var callback:WatcherCallback = {};
                for (var i in this._watcherOptions.methods) {
                    if (this._watcherOptions.methods.hasOwnProperty(i) && this._watcherOptions.methods[i]) {
                        callback[i] = this._watcherDelayed[i];
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