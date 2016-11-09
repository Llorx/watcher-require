import { CustomRequire } from "custom-require";
import * as chokidar from "chokidar";
import { FSWatcher } from "fs";

export interface WatcherOptions {
    delay?:number;
    persistent?:boolean;
}

export class WatcherRequire extends CustomRequire {
    _watcherOptions:WatcherOptions;
    _watcherCallback:()=>void;
    _watcherTimeout:NodeJS.Timer;
    _watcher:FSWatcher;
    constructor(callback:()=>void, options:WatcherOptions) {
        super((module:NodeModule) => {
            this._watcher.add(module.filename);
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
        })
        .on("add", this._watcherNotify.bind(this))
        .on("change", this._watcherNotify.bind(this))
        .on("unlink", this._watcherNotify.bind(this));
        this._watcherOptions = options;
        this._watcherCallback = callback;
    }
    _watcherNotify() {
        clearTimeout(this._watcherTimeout);
        this._watcherTimeout = setTimeout(this._watcherCallback, this._watcherOptions.delay);
    }
    dispose() {
        super.dispose();
        this._watcher.close();
        clearTimeout(this._watcherTimeout);
    }
}