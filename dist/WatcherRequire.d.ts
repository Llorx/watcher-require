/// <reference types="node" />
/// <reference types="chokidar" />
import { CustomRequire, CustomNodeModule } from "custom-require";
import { FSWatcher } from "fs";
export { CustomNodeModule };
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
    _watcher: FSWatcher;
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
