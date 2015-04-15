'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var request = require('request'),

//FileCookieStore = require('file-cookie-store'),
FileCookieStore = require('tough-cookie-filestore'),
    Promise = require('bluebird'),
    jsdom = require('jsdom'),
    jquery = require('jquery');

var requestAsync = Promise.method(request);
Promise.promisifyAll(jsdom);

var JBot = (function () {
    function JBot(cookieFile) {
        _classCallCheck(this, JBot);

        this._headers = {};
        this._cookieStore = undefined;
        if (cookieFile) this._cookieStore = new FileCookieStore(cookieFile);
        //this._cookieStore = new FileCookieStore(cookieFile, {
        //    force_parse: false,
        //    lockfile: true,
        //    mode: 644,
        //    http_only_extension: true,
        //    lockfile_retries: 200,
        //    auto_sync: true
        //});
        this._jar = request.jar(this._cookieStore);
        this._req = request.defaults({ jar: this._jar });
        Promise.promisifyAll(this._req);
    }

    _createClass(JBot, [{
        key: 'setHeaders',
        value: function setHeaders(headers) {
            this._headers = headers;
            return this;
        }
    }, {
        key: 'get',
        value: function get(url, options) {
            return this._req.getAsync(url, collectOptions({
                followAllRedirects: true,
                headers: this._headers,
                encoding: null
            }, options));
        }
    }, {
        key: 'post',
        value: function post(url, data, options) {
            return this._req.postAsync(collectOptions({
                url: url,
                formData: data,
                followAllRedirects: true,
                headers: this._headers,
                encoding: null
            }, options));
        }
    }, {
        key: 'getJSON',
        value: function getJSON(url, options) {
            return this.get(url, options).spread(function (ret, body) {
                return JSON.parse(body.toString());
            });
        }
    }, {
        key: 'postJSON',
        value: function postJSON(url, data, options) {
            return this.post(url, data, options).spread(function (ret, body) {
                return JSON.parse(body.toString());
            });
        }
    }, {
        key: 'getDOM',
        value: function getDOM(url, options) {
            return this.get(url, options).spread(this._jquerify.bind(this));
        }
    }, {
        key: 'postDOM',
        value: function postDOM(url, data, options) {
            return this.post(url, data, options).spread(this._jquerify.bind(this));
        }
    }, {
        key: '_jquerify',
        value: function _jquerify(ret, body) {
            var html = body.toString();
            return jsdom.envAsync(html, {
                html: html,
                url: ret.request.href
            }).then(function (window) {
                return [window, jquery(window), html];
            });
        }
    }], [{
        key: 'collectOptions',
        value: function collectOptions() {
            var ret = {};
            var len = arguments.length;
            for (var i = 0; i < len; i++) {
                for (var p in arguments[i]) {
                    if (arguments[i].hasOwnProperty(p)) {
                        ret[p] = arguments[i][p];
                    }
                }
            }
            return ret;
        }
    }]);

    return JBot;
})();

module.exports = JBot;

//# sourceMappingURL=JBot.js.map