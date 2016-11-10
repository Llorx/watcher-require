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
        _super.call(this, function (mod) {
            _this._watcherList[mod.filename] = mod;
            _this._watcher.add(mod.filename);
        }, function (modlist) {
            for (var _i = 0, modlist_1 = modlist; _i < modlist_1.length; _i++) {
                var mod = modlist_1[_i];
                delete _this._watcherList[mod.filename];
                _this._watcher.unwatch(mod.filename);
            }
        });
        this._watcherTimeout = null;
        this._watcherList = {};
        this._watcherDelayed = {};
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
            };
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
    WatcherRequire.prototype._watcherNotify = function (method, path) {
        var _this = this;
        var mod = this._watcherList[path];
        if (this._watcherDelayed[method].indexOf(mod) < 0) {
            this._watcherDelayed[method].push(mod);
        }
        if (this._watcherTimeout == null) {
            this._watcherTimeout = setTimeout(function () {
                _this._watcherTimeout = null;
                var callback = {};
                for (var i in _this._watcherOptions.methods) {
                    if (_this._watcherOptions.methods.hasOwnProperty(i) && _this._watcherOptions.methods[i]) {
                        callback[i] = _this._watcherDelayed[i];
                        _this._watcherDelayed[i] = [];
                    }
                }
                _this._watcherCallback(callback);
            }, this._watcherOptions.delay);
        }
    };
    WatcherRequire.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._watcher.close();
        clearTimeout(this._watcherTimeout);
        this._watcherTimeout = null;
        this._watcherList = {};
        this._watcherDelayed = {};
    };
    return WatcherRequire;
}(custom_require_1.CustomRequire));
exports.WatcherRequire = WatcherRequire;
//# sourceMappingURL=WatcherRequire.js.map