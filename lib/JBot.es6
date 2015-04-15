var request = require('request'),
    //FileCookieStore = require('file-cookie-store'),
    FileCookieStore = require('tough-cookie-filestore'),
    Promise = require('bluebird'),
    jsdom = require('jsdom'),
    jquery = require('jquery')
;

var requestAsync = Promise.method(request);
Promise.promisifyAll(jsdom);



class JBot {
    
    
    static collectOptions() {
        var ret = {};
        var len = arguments.length;
        for(var i = 0; i < len; i++) {
            for(var p in arguments[i]) {
                if(arguments[i].hasOwnProperty(p)) {
                    ret[p] = arguments[i][p];
                }
            }
        }
        return ret;
    }
    
    
    constructor(cookieFile) {
        this._headers = {};
        this._cookieStore = undefined;
        if(cookieFile)
            this._cookieStore = new FileCookieStore(cookieFile);
            //this._cookieStore = new FileCookieStore(cookieFile, {
            //    force_parse: false,
            //    lockfile: true,
            //    mode: 644,
            //    http_only_extension: true,
            //    lockfile_retries: 200,
            //    auto_sync: true
            //});
        this._jar = request.jar(this._cookieStore);
        this._req = request.defaults({jar: this._jar});
        Promise.promisifyAll(this._req);
    }
    
    
    setHeaders(headers) {
        this._headers = headers;
        return this;
    }
    
    
    get(url, options) {
        return this._req.getAsync(url, JBot.collectOptions({
            followAllRedirects: true,
            headers: this._headers,
            encoding: null
        }, options));
    }
    
    
    post(url, data, options) {
        return this._req.postAsync(JBot.collectOptions({
            url: url,
            formData: data,
            followAllRedirects: true,
            headers: this._headers,
            encoding: null
        }, options));
    }
    
    
    getJSON(url, options) {
        return this.get(url, options).spread(function(ret, body) {
            return JSON.parse(body.toString());
        });
    }
    
    
    postJSON(url, data, options) {
        return this.post(url, data, options).spread(function(ret, body) {
            return JSON.parse(body.toString());
        });
    }
    
    
    getDOM(url, options) {
        return this.get(url, options).spread(this._jquerify.bind(this));
    }
    
    
    postDOM(url, data, options) {
        return this.post(url, data, options).spread(this._jquerify.bind(this));
    }
    
    
    _jquerify(ret, body) {
        var html = body.toString();
        return jsdom.envAsync(html, {
            html: html,
            url: ret.request.href
        }).then(function(window) {
            return [window, jquery(window), html];
        });
    }
    
    
}


module.exports = JBot;