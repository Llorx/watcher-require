"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var custom_require_1 = require("custom-require");
var fs = require("fs");
var chokidar;
try {
    chokidar = require("chokidar");
}
catch (e) {
}
var Watcher = (function () {
    function Watcher(options) {
        this.watchers = {};
        this._events = {};
        this.timeouts = {};
        if (!options) {
            options = {};
        }
        if (chokidar) {
            this.watcher = chokidar.watch([], {
                persistent: options.persistent
            });
        }
        else {
            this.options = options;
        }
    }
    Watcher.prototype.call = function (event, filename) {
        var _this = this;
        clearTimeout(this.timeouts[filename]);
        this.timeouts[filename] = setTimeout(function () {
            delete _this.timeouts[filename];
            if (_this._events[event]) {
                for (var _i = 0, _a = _this._events[event]; _i < _a.length; _i++) {
                    var callback = _a[_i];
                    callback(filename);
                }
            }
        }, 50);
    };
    Watcher.prototype.checkFile = function (filename) {
        if (fs.existsSync(filename)) {
            this.call("change", filename);
        }
        else {
            this.call("unlink", filename);
        }
    };
    Watcher.prototype.add = function (filename) {
        if (this.watcher) {
            this.watcher.add(filename);
        }
        else {
            filename = require.resolve(filename);
            if (!this.watchers[filename]) {
                this.call("add", filename);
                this.watchers[filename] = fs.watch(filename, {
                    persistent: this.options.persistent
                }, this.checkFile.bind(this, filename));
            }
        }
    };
    Watcher.prototype.unwatch = function (filename) {
        if (this.watcher) {
            this.watcher.unwatch(filename);
        }
        else {
            filename = require.resolve(filename);
            if (this.watchers[filename]) {
                this.watchers[filename].close();
                delete this.watchers[filename];
            }
        }
    };
    Watcher.prototype.on = function (event, callback) {
        if (this.watcher) {
            this.watcher.on(event, callback);
        }
        else {
            if (!this._events[event]) {
                this._events[event] = [];
            }
            this._events[event].push(callback);
        }
    };
    Watcher.prototype.close = function () {
        if (this.watcher) {
            this.watcher.close();
        }
        else {
            for (var i in this.watchers) {
                if (this.watchers.hasOwnProperty(i)) {
                    this.watchers[i].close();
                }
            }
            this.watchers = {};
            this._events = {};
        }
    };
    return Watcher;
}());
exports.Watcher = Watcher;
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
        this._watcher = new Watcher(options);
        for (var method in options.methods) {
            if (options.methods.hasOwnProperty(method) && options.methods[method]) {
                this._watcherDelayed[method] = [];
                this._watcher.on(method, this._watcherNotify.bind(this, method));
            }
        }
        this._watcherOptions = options;
        this._watcherCallback = callback;
    }
    WatcherRequire.prototype._watcherNotify = function (method, path) {
        var _this = this;
        if (this._watcherDelayed[method].indexOf(path) < 0) {
            this._watcherDelayed[method].push(path);
        }
        if (this._watcherTimeout == null) {
            this._watcherTimeout = setTimeout(function () {
                _this._watcherTimeout = null;
                var callback = {};
                for (var method_1 in _this._watcherOptions.methods) {
                    if (_this._watcherOptions.methods.hasOwnProperty(method_1) && _this._watcherOptions.methods[method_1]) {
                        callback[method_1] = _this._watcherDelayed[method_1];
                        for (var i = 0; i < callback[method_1].length; i++) {
                            callback[method_1][i] = _this._watcherList[callback[method_1][i]];
                        }
                        _this._watcherDelayed[method_1] = [];
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