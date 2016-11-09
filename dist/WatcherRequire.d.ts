/// <reference types="node" />
/// <reference types="chokidar" />
import { CustomRequire } from "custom-require";
import { FSWatcher } from "fs";
export interface WatcherOptions {
    delay?: number;
    persistent?: boolean;
}
export declare class WatcherRequire extends CustomRequire {
    _watcherOptions: WatcherOptions;
    _watcherCallback: () => void;
    _watcherTimeout: NodeJS.Timer;
    _watcher: FSWatcher;
    constructor(callback: () => void, options: WatcherOptions);
    _watcherNotify(): void;
    dispose(): void;
}
