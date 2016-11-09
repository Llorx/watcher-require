"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var custom_require_1 = require("custom-require");
var chokidar = require("chokidar");
var WatcherRequire = (function (_super) {
    __extends(WatcherRequire, _super);
    function WatcherRequire(callback, options) {
        var _this = this;
        _super.call(this, function (module) {
            _this._watcher.add(module.filename);
        });
        if (!options) {
            options = {
                delay: 300,
                persistent: true
            };
        }
        else if (options.delay == null || !isFinite(options.delay)) {
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
    WatcherRequire.prototype._watcherNotify = function () {
        clearTimeout(this._watcherTimeout);
        this._watcherTimeout = setTimeout(this._watcherCallback, this._watcherOptions.delay);
    };
    WatcherRequire.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._watcher.close();
        clearTimeout(this._watcherTimeout);
    };
    return WatcherRequire;
}(custom_require_1.CustomRequire));
exports.WatcherRequire = WatcherRequire;
//# sourceMappingURL=WatcherRequire.js.map