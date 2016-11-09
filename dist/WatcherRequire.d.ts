/// <reference types="node" />
/// <reference types="chokidar" />
import { CustomRequire } from "custom-require";
import { FSWatcher } from "fs";
export interface WatcherOptions {
    delay?: number;
    persistent?: boolean;
}
export interface WatcherCallback {
    add?: NodeModule[];
    change?: NodeModule[];
    unlink?: NodeModule[];
}
export declare class WatcherRequire extends CustomRequire {
    _watcherOptions: WatcherOptions;
    _watcherCallback: (changes: WatcherCallback) => void;
    _watcherTimeout: NodeJS.Timer;
    _watcher: FSWatcher;
    _watcherList: {
        [file: string]: NodeModule;
    };
    _watcherMethods: string[];
    _watcherDelayed: {
        [type: string]: NodeModule[];
    };
    constructor(callback: (changes?: WatcherCallback) => void, options?: WatcherOptions);
    _watcherNotify(method: string, path: string): void;
    dispose(): void;
}
