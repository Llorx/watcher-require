/// <reference types="node" />
/// <reference types="chokidar" />
import { CustomRequire, CustomNodeModule } from "custom-require";
export { CustomNodeModule };
import * as fs from "fs";
export declare class Watcher {
    watcher: fs.FSWatcher;
    watchers: {
        [file: string]: fs.FSWatcher;
    };
    _events: {
        [event: string]: Function[];
    };
    options: WatcherOptions;
    timeouts: {
        [filename: string]: any;
    };
    constructor(options?: WatcherOptions);
    call(event: string, filename: string): void;
    checkFile(filename: string): void;
    add(filename: string): void;
    unwatch(filename: string): void;
    on(event: string, callback: Function): void;
    close(): void;
}
export interface WatcherOptions {
    delay?: number;
    persistent?: boolean;
    methods?: {
        add: boolean;
        change: boolean;
        unlink: boolean;
    };
}
export interface WatcherCallback {
    add?: CustomNodeModule[];
    change?: CustomNodeModule[];
    unlink?: CustomNodeModule[];
}
export declare class WatcherRequire extends CustomRequire {
    _watcherOptions: WatcherOptions;
    _watcherCallback: (changes: WatcherCallback) => void;
    _watcherTimeout: NodeJS.Timer;
    _watcher: Watcher;
    _watcherList: {
        [file: string]: CustomNodeModule;
    };
    _watcherDelayed: {
        [type: string]: string[];
    };
    constructor(callback: (changes?: WatcherCallback) => void, options?: WatcherOptions);
    _watcherNotify(method: string, path: string): void;
    dispose(): void;
}
