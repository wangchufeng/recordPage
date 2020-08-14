/* eslint-disable */

var reportEvent = (function() {
    // cookie工具类
    !function(e){var n=!1;if("function"==typeof define&&define.amd&&(define(e),n=!0),"object"==typeof exports&&(module.exports=e(),n=!0),!n){var o=window.Cookies,t=window.Cookies=e();t.noConflict=function(){return window.Cookies=o,t}}}(function(){function g(){for(var e=0,n={};e<arguments.length;e++){var o=arguments[e];for(var t in o)n[t]=o[t]}return n}return function e(l){function C(e,n,o){var t;if("undefined"!=typeof document){if(1<arguments.length){if("number"==typeof(o=g({path:"/"},C.defaults,o)).expires){var r=new Date;r.setMilliseconds(r.getMilliseconds()+864e5*o.expires),o.expires=r}o.expires=o.expires?o.expires.toUTCString():"";try{t=JSON.stringify(n),/^[\{\[]/.test(t)&&(n=t)}catch(e){}n=l.write?l.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=(e=(e=encodeURIComponent(String(e))).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent)).replace(/[\(\)]/g,escape);var i="";for(var c in o)o[c]&&(i+="; "+c,!0!==o[c]&&(i+="="+o[c]));return document.cookie=e+"="+n+i}e||(t={});for(var a=document.cookie?document.cookie.split("; "):[],s=/(%[0-9A-Z]{2})+/g,f=0;f<a.length;f++){var p=a[f].split("="),d=p.slice(1).join("=");this.json||'"'!==d.charAt(0)||(d=d.slice(1,-1));try{var u=p[0].replace(s,decodeURIComponent);if(d=l.read?l.read(d,u):l(d,u)||d.replace(s,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(e){}if(e===u){t=d;break}e||(t[u]=d)}catch(e){}}return t}}return(C.set=C).get=function(e){return C.call(C,e)},C.getJSON=function(){return C.apply({json:!0},[].slice.call(arguments))},C.defaults={},C.remove=function(e,n){C(e,"",g(n,{expires:-1}))},C.withConverter=e,C}(function(){})});

    var _cookies = Cookies.noConflict();

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }

    // 全局配置信息
    var _config = {
        env: 'dev',
        debug: false,
        // 日志上报请求地址
        reportUrl: '',
        // 初始化时外部传入参数
        options: {
            // 小程序上使用真实的appId, H5上使用以下3种枚举值:  非微信: h5-normal, 公众号: 默认h5-gzh, 开发者可在初始化时配置覆盖(公众号appid), 小程序: 真实appid
            // 留空则根据环境自动识别
            appId: '',
            // 活动id
            activeId: '',
            // 'app', 'gzh', 'web'
            h5Type: 'web',
            version: '',
            openId: '',
            // 是否SPA页面, SPA模式需要开发者单独上报页面的onShow与onHide事件
            spa: false,
            // 是否开启调试模式, debug模式支持本地上报, 不需要讲页面上传到cdn再调试
            debug: false,
            // 是否全部切换到beacon模式, 默认是用ajax上报, 开启本开关将使本页面全部切到sendBeacon模式
            // 在页面关闭时, 如果是ajax方式, 最后的几个事件可能无法上报成功
            // sendBeacon是新的API, 兼容性不好, 但能保证页面关闭后数据能继续上报
            sendBeacon: false
        },
        // 小程序传过来的参数
        appId: '',
        activeId: '',
        wtagid: '',
        scene: '',
        channel: '',
        openId: '',
        sessionId: '',
        sequenceId: 0,

        // 是否已初始化标志
        ready: false,
        // 页面缩放比例
        scale: 1,
        // 最后一次操作时间
        actionTime: Date.now(),
        // 来源枚举值, 区分小程序和h5
        h5Types: ['app', 'gzh', 'web'],
        source: ['app', 'h5'],
        events: ['onLoad', 'onShow', 'onHide', 'onUnload', 'click', 'custom'],

    };

    // 允许解析为json_tag的事件列表
    // 默认日志标签是weblog, 这种情况elk不解析extend
    // 需要解析extend的地方可以指定为json_tag
    var _jsonTag = [
        { event: 'onLoad', msg: 'enterApp' },
        { event: 'onLoad', msg: 'enterPage' },
        { event: 'onShow', msg: 'enterPage' },
        { event: 'onHide', msg: 'leavePage' },
        { event: 'onUnload', msg: 'leavePage' },
        { event: 'custom', msg: 'REQ_REQ' },
        { event: 'custom', msg: 'REQ_RES_SUCCESS' },
        { event: 'custom', msg: 'REQ_RES_FAIL' }
    ];

    // 页面跳转记录
    var _pageHis = {
        // 上个页面
        from: {
            url: '',
            query: '',
            time: Date.now()
        },
        // 当前页
        cur: {
            url: '',
            query: '',
            time: Date.now()
        },
        // 下个页面
        to: {
            url: '',
            query: '',
            time: Date.now()
        }
    };

    var _$ = function(_sel, _ifArray) {
        var _obj = null;
        switch (_sel[0]) {
            case '#':
                _obj = document.getElementById(_sel.substr(1));
                break;
            case '.':
                _obj = document.getElementsByClassName(_sel.substr(1));
                break;
            default:
                _obj = document.getElementsByTagName(_sel);
                break;
        }
        return _obj;
    };

    var _ajax = function(_url, _data, _cbSuccess, _cbFail) {
        if (_url && _data) {
            var _xhr = new XMLHttpRequest();
            _xhr.open('POST', _url);
            _xhr.setRequestHeader('Content-Type', 'application/json');
            _xhr.onload = function() {
                console.log('ajax res: ', _xhr.status, _xhr.responseText);
                if (_xhr.status == 200 && _xhr.responseText) {
                    _cbSuccess && _cbSuccess(JSON.parse(_xhr.responseText));
                }
                else if (_xhr.status != 200) {
                    _cbFail && _cbFail(_xhr.responseText);
                }
            };
            _xhr.send(JSON.stringify(_data));
        }
    };

    // 页面关闭时, ajax可能发不出去, 这个新的API可以解决这个问题, 但兼容性不好
    // 另外此API有长度限制, 太长的话会发不出去, 所以这个API仅用来发送页面关闭事件
    // https://usefulangle.com/post/62/javascript-send-data-to-server-on-page-exit-reload-redirect
    // https://usefulangle.com/post/63/javascript-navigator-sendbeacon-set-form-http-header
    var _sendBeacon = function(_data) {
        // 优先使用sendBeacon, 如果不支持的话就回退到ajax
        // 同步ajax在很多设备上会被禁用, 反而导致更大的丢失, 所以用异步ajax
        if (navigator && navigator.sendBeacon) {
            if (_data && _data.body) {
                // 记录使用sendBeacon的数据
                if (_data.body.items && _data.body.items[0] && _data.body.items[0].extend) {
                    _data.body.items[0].extend.sendBeacon = 1;
                }
                navigator.sendBeacon(_config.reportUrl, JSON.stringify(_data));
                console.log('sendBeacon触发', _data);
            }
        } else {
            _ajax(_config.reportUrl, _data);
            console.log('sendBeacon回退到ajax', _data);
        }
    };

    // 发送请求
    var _request = function(_data, _cbSuccess, _cbFail) {
        if (_config.options.sendBeacon) {
            _sendBeacon(_data);
        } else {
            _ajax(_config.reportUrl, _data, function(_res) {
                if (_cbSuccess && typeof _cbSuccess === 'function') {
                    _cbSuccess(_res);
                }
            }, function(_err) {
                if (_cbFail && typeof _cbFail === 'function') {
                    _cbFail(_err);
                }
            });
        }
    };

    // _event: enterPage, leavePage必填
    // _url, _query: 当前页面的url和query, 可缺省, 默认从网址中获取
    // _toUrl, _toQuery: 目标页面的url和query, enterPage不需要提供, leavePage应该提供, 缺失不会报错但应该提供
    // query是字符串
    var _updatePageHis = function(_option) {
        if (_option && _option.event) {
            var _event = _option.event;
            var _query = _option.query || location.search || '';
            _query = _query.replace('?', '');
            var _url = _option.url || _pageHis.cur.url || (location.origin + location.pathname);
            var _toUrl = _option.toUrl || '';
            var _toQuery = _option.toQuery || '';
            if (_event == 'enterPage') {
                // 还没更新才执行更新, 因为onload和onshow触发都需要做这个事
                if (_url + _query != _pageHis.cur.url + _query) {
                    // 这里的from, to描述上一个页面的行为
                    _pageHis.from = JSON.parse(JSON.stringify(_pageHis.cur)) || {};
                    _pageHis.cur = {
                        url: _url,
                        query: _query,
                        time: Date.now()
                    };
                    _pageHis.to = JSON.parse(JSON.stringify(_pageHis.cur));
                } else {
                    console.log('enterPage pageHis已更新');
                }
            } else if (_event == 'leavePage') {
                // if (_url + _query != _pageHis.from.url + _pageHis.from.query) {
                if (_toUrl + _query != _pageHis.cur.url + _pageHis.cur.query) {
                    // 这里的from, to描述当前页面的行为
                    _pageHis.from = JSON.parse(JSON.stringify(_pageHis.cur));
                    _pageHis.to = {
                        url: _toUrl,
                        query: _toQuery,
                        time: Date.now()
                    };
                    if (!_toUrl) {
                        console.warn('目标地址不应该缺失');
                    }
                } else {
                    console.log('leavePage pageHis已更新');
                }
            }
            console.log('pageHis', JSON.parse(JSON.stringify(_pageHis)));
        } else {
            console.error('updatePageHis参数错误', _option);
        }
    };

    // 获取页面停留时间, 一般是在onUnload或者onHide中调用
    var _getPageStayTime = function() {
        // 计算页面停留时间
        var _stayTime = 0;
        var _params = {};
        if (_pageHis && _pageHis.cur && _pageHis.cur.time) {
            _stayTime = Date.now() - _pageHis.cur.time;
            _params = { pageStayTimeMS: _stayTime };
        }
        return _params;
    };

    /***
     * 补齐位数
     * @param number[int]: 要补齐的数字本身
     * @param count[int]: 数字的位数，2位数、3位数类似这种
     * @param feature[string]: 用于补齐位数的特征，默认是0
     */
    var _paddingNumber = function(number, count, feature) {
        var c = count || 2;
        var f = feature || '0';
        var template = [];
        for (var i = 0; i < c; i++) {
            template.push(f);
        }
        var numStr = number + '';
        var len = numStr.length;
        if (len > c) {
            console.log('数字不能超出指定的位数');
        } else {
            for (var i = len - 1, j = template.length - 1; i >= 0; i--, j--) {
                template[j] = numStr[i];
            }
        }
        return template.join('');
    };
    /***
     * 把一个数字转换为16进制
     * @param number
     */
    var _toHexadecimal = function(number) {
        if (typeof number === 'number' && number >= 0) {
            return parseInt(number, 10).toString(16);
        } else {
            console.log('只支持正数的处理');
        }
    };
    // 获取随机整数, bits: 位数
    var _getRandInt = function(_bits) {
        _bits = _bits || 5;
        return (Math.round(Math.random() * Math.pow(10, _bits)));
    };
    // 更新sessionId
    var _getSessionId = function() {
        return (_getRandInt() + '' + Date.now() + '' + _getRandInt());
    };
    var _updateSessionId = function() {
        // 如果长时间停留在小程序没有操作, 因为页面一直没关所以sessionId一直没刷新
        // 新增一个30分钟刷新sessionId逻辑, 超过30分钟没操作就刷新
        if (!_config.sessionId || Date.now() - _config.actionTime > 1800000) {
            console.warn('update APP_SESSION_ID', Date.now() - _config.actionTime);
            _config.sessionId = _getSessionId();
        }
        // 每次操作都更新最后操作时间
        _config.actionTime = Date.now();
    };

    // query解析
    var _parseQuery = function(_queryString) {
        _queryString = _queryString || location.search || '';
        _queryString = _queryString && _queryString.replace('?', '') || '';
        // 把query转成对象
        var _queryList = _queryString.split('&');
        var _query = {};
        for (var i = 0; i < _queryList.length; i++) {
            if (_queryList[i]) {
                var _tmp = _queryList[i].split('=');
                _query[_tmp[0]] = _tmp[1];
            }
        }
        return _query;
    };
    // 把query对象转成
    var _stringifyQuery = function(_query) {
        var _queryString = '';
        if (typeof _query === 'string') {
            _queryString = _query;
        } else if (typeof _query === 'object') {
            var _tmp = [];
            for (var i in _query) {
                _tmp.push(i + '=' + decodeURIComponent(_query[i]));
            }
            _queryString = _tmp.join('&');
            _queryString = _queryString.replace('?', '');
        }
        return _queryString;
    };

    // utc时间转换成YYYYMMDDHHMMSS
    var _utcToYMD = function(_utc) {
        var _date = new Date(_utc || Date.now());
        var _year = _date.getFullYear();
        var _month = _date.getMonth() + 1;
        (_month < 10) && (_month = '0' + _month);
        var _day = _date.getDate();
        (_day < 10) && (_day = '0' + _day);
        var _hour = _date.getHours();
        (_hour < 10) && (_hour = '0' + _hour);
        var _minute = _date.getMinutes();
        (_minute < 10) && (_minute = '0' + _minute);
        var _sec = _date.getSeconds();
        (_sec < 10) && (_sec = '0' + _sec);
        return ('' + _year + _month + _day + _hour + _minute + _sec);
    };

    // 根据url取当前环境后台
    var _getEnv = function() {
        var path = location.hostname + location.pathname;
        var result = '';
        var envMatch = path.match(/\/(dev|sit|uat)[\w]*/i);
        if (envMatch && envMatch.length > 1) {
            result = envMatch[1]
        } else if (path.indexOf('.wesure.cn/') > -1) {
            result = 'prd';
        }
        // 如果非调试模式, 且没有匹配的url, 说明是第三方合作伙伴的域名
        // 第三方只支持sit与prd模式, 不是sit就默认给prd
        else {
            if (_config.debug) {
                result = 'sit';
            } 
            else {
                result = 'prd';
            }
        }

        // 本地域名只上报到sit
        var _host = location.hostname || '';
        if (_host.indexOf('127.0.0.1') >= 0 || _host.indexOf('localhost') >= 0) {
            result = 'sit';
        }

        console.log('env: ', result);
        return result;
    };
    // 获取后台上报地址
    var _getReportUrl = function() {
        var _envs = ['dev', 'sit', 'uat', 'prd'];
        var _validFlag = false;
        for (var i = 0; i < _envs.length; i++) {
            if (_envs[i] == _config.env) {
                _validFlag = true;
                break;
            }
        }
        if (_validFlag) {
            var _host = 'https://devapi.wesure.cn/';
            var _path = _config.env + 'app/api/weblog';
            if (_config.env == 'prd') {
                _host = 'https://api.wesure.cn/';
                _path = 'api/weblog';
            }
            return (_host + _path);
        } else {
            console.log('URL错误, 需要部署到服务器', _config.env);
            return '';
        }
    };

    var _index = 0;
    // 寻找最近的有daid的父节点
    var _findParentWithDaid = function(_elem) {
        _index++;
        var _daid = '';
        if (_elem) {
            // 找到了直接把daid返回
            if (_elem.dataset && _elem.dataset.daid) {
                _daid = _elem.dataset.daid;
            }
            // 没找到就遍历父节点
            else {
                // 有父节点就遍历, 没有就直接返回
                if (_elem.parentNode) {
                    var _tmp = _findParentWithDaid(_elem.parentNode);
                    if (_tmp) {
                        _daid = _tmp;
                    }
                }
            }
        }
        return _daid;
    };

    // 点击事件上报
    var _clickReport = function(e) {
        // 有设置了daid才上报
        var _daid = _findParentWithDaid(e && e.srcElement);
        if (_daid) {
            console.log('report click event', _daid);
            _reportEvent.reportEvent('click', 'logReportEvent', {
                elemId: _daid,
                touch: {
                    // 相对于屏幕位置
                    clientX: Math.round(e.clientX / _config.scale),
                    clientY: Math.round(e.clientY / _config.scale),
                    // 相对于文档位置, px方案这个值不准确, 待解决
                    pageX: Math.round(e.pageX / _config.scale),
                    pageY: Math.round(e.pageY / _config.scale),
                    // 屏幕缩放比例, scale一般是等于0.5, 但是这里直接换算好了, 所以给1
                    r: 1
                }
            });
        }
    };

    // 初始化点击事件上报
    var _initClickReport = function() {
        // 监听页面的所有click事件
        // 互斥锁, 避免tap和click同时触发, tap优先
        var _tapState = false;
        _$('body')[0].addEventListener('tap', function(e) {
            _tapState = true;
            _clickReport(e);
        });
        _$('body')[0].addEventListener('click', function(e) {
            // tap已经触发了就不再触发click
            if (!_tapState) {
                _clickReport(e);
            }
        });
    };

    // 页面关闭事件需要特殊处理, 因为页面关闭有可能让ajax发送失败
    // beforeunload, unload, pagehide做的是相同的事, 只处理一次即可
    var _unloadFlag = false;
    var _unloadReport = function(_name) {
        console.log('unloadReport: ', _name);
        if (!_unloadFlag) {
            _unloadFlag = true;
            var _pageStayTime = _getPageStayTime() || {};
            var _data = _buildData('onUnload', 'leavePage', {
                trigger: _name,
                url: location.href,
                options: _config.options,
                ua: navigator.userAgent,
                pageStayTimeMS: _pageStayTime.pageStayTimeMS || 0
            });
            if (_data && _data.body) {
                _sendBeacon(_data);
            }
        }
    };

    // 初始化全部事件
    var _initEvent = function() {
        _initClickReport();

        // addEventListener这种方式注册事件允许同时有多个回调, 这样就不会影响页面本身的事件
        window.addEventListener('error', function(_err) {
            console.log('error', _err);
            !_err && (_err = {});
            var _fileName = _err.filename || '';
            var _lineNum = (_err.lineno || '') + ':' + (_err.colno || '');
            var _msg = _err.error && _err.error.message || '';
            var _stack = _err.error && _err.error.stack || '';
            var _reg = new RegExp(_fileName, 'g');
            var _errInfo = {
                fileName: _fileName,
                lineNum: _lineNum,
                msg: _msg,
                stack: _stack.replace(_reg, '')
            };
            _reportEvent.reportEvent('custom', 'onError', {
                errInfo: _errInfo,
                url: location.href,
                options: _config.options,
                ua: navigator.userAgent
            });
        });

        // beforeunload, unload, pagehide做的是相同的事, 为了提高上报成功率, 所以多做冗余
        window.addEventListener('beforeunload', function(event) {
            _unloadReport('beforeunload');
        });

        window.addEventListener('unload', function(event) {
            _unloadReport('unload');
        });

        window.addEventListener('pagehide', function(event) {
            _unloadReport('pagehide');
        });
    };

    // 是否微信环境
    var _ifWeixn = function () {
        var ua = navigator && navigator.userAgent && navigator.userAgent.toLowerCase() || '';
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    };

    // 随机生成的字符串, 用来标识设备, 生成后保存在localStorage, 除非被用户清空, 否则永久不变
    var _deviceId = '';
    var _getDeviceId = function() {
        var _storeKey = 'WEBLOG_DEVICEID';
        if (!_deviceId) {
            try {
                _deviceId = _cookies.get(_storeKey) || localStorage[_storeKey];
            } catch (e) {
                _deviceId = '';
                console.error('wx.getStorageSync ERROR', e);
            }
        }
        // 微保的域名使用固定domain, 其他的使用默认值
        var _extend = { expires: 36500};
        if (location.host.indexOf('.wesure.cn') >= 0) {
            _extend = { expires: 36500, path: '/', domain: '.wesure.cn' };
        }
        if (!_deviceId) {
            _deviceId = Math.round(Math.random() * 100000) + '' + Date.now() + '' + Math.round(Math.random() * 100000);
            localStorage[_storeKey] = _deviceId;
            _cookies.set(_storeKey, _deviceId, _extend);
        }
        // 容错处理, 兼容之前没有cookie的情况, 保证cookie与storage同步
        if (localStorage[_storeKey] != _cookies.get(_storeKey)) {
            localStorage[_storeKey] = _deviceId;
            _cookies.set(_storeKey, _deviceId, _extend);
        }
        return _deviceId;
    };

    // 由于队列可能在页面关闭时导致更大的数据丢失(整个队列的数据都无法上报成功), 所以暂时不用队列的功能

    // 1. 日志上报增加缓存, 缓存数据达到20条再上报
    // 2. 为了避免数据丢失, 每10秒也上报一次 
    // 3. App onHide事件一旦触发就把所有缓存数据全部上报
    // 4. 用户登录完成后, 如果缓存中的数据没有openid, 则用登录获取的openid把缓存中的数据补齐
    // 除了用户直接杀微信进程, 这种情况最多丢失10s数据, 其他情况都能保证数据被完整上报
    // 请求队列
    var _reportQueue = [];
    var _addToQueue = function(_data, _cbSuccess) {
        _data && _reportQueue.push(_data);
        if (_ifDataReady()) {
            _reportEvent.reportAllQueue();
        }
        // 这里改成队列如果等到队列发送完成再执行回调时效性会有问题, 日志上报的回调很少使用, 所以直接执行不等网络返回
        // _cbFail不处理
        if (_cbSuccess && typeof _cbSuccess === 'function') {
            _cbSuccess();
        }
    };

    // 为了防止数据丢失, h5日志默认场景都不使用队列
    // 另外增加了reportEventList接口, 使用此接口的会使用队列, 但不延时, 队列数据处理完就立即reportAllQueue上报队列, 保证数据不丢失
    // h5有一个问题, 在页面关闭时请求有可能发不出去, 如果队列太长有可能丢失太多数据, 所以这里的队列长度比小程序小
    // 10条上报一次, 如果还没有openid就再等一下, 需要把没有openid的数据补齐
    // 如果大于20条还是没有则直接上报, 避免队列太大低端机内存不够
    var _ifDataReady = function() {
        var _flag = false;
        if (_reportQueue.length >= 10 && _config.options.openId || _reportQueue.length >= 20) {
            _flag = true;
        }
        return _flag;
    };

    // 如果10s内都没有上报则强制上报一次, 避免数据丢失
    // 每10秒检查一次, 避免太大延时
    var _lastReportQueueTime = 0;
    setInterval(function() {
        if (Date.now() - _lastReportQueueTime >= 10000) {
            _lastReportQueueTime = Date.now();
            _reportEvent.reportAllQueue();
        }
    }, 10000);

    // 格式化数据
    var _buildData = function(_event, _name, _params, _cbSuccess, _cbFail) {
        if (!_config.ready) {
            console.error('需要先调用reportEvent.init方法初始化');
            return;
        }
        _updateSessionId();
        // _params必须是对象
        _params = _params || {};
        if (typeof _params !== 'object' || _params.length >= 0) {
            console.error('param必须是对象', _params);
            return;
        }
        // evnet必须是枚举类型
        var _validFlag = false;
        for (var i = 0; i < _config.events.length; i++) {
            if (_config.events[i] == _event) {
                _validFlag = true;
                break;
            }
        }
        if (!(_event && typeof _event === 'string' && _validFlag)) {
            console.error('事件类型必须是枚举', _config.events);
            return;
        }
        // 事件名不能为空
        if (!(_name && typeof _name === 'string')) {
            console.error('事件名必须是字符串', _name);
            return;
        }
        // 如果是click事件一定要有elemId
        var _elemId = '';
        if (_event == 'click') {
            if (!_params.elemId) {
                console.error('click事件必须提供elemId', _params.elemId);
                return;
            } else {
                _elemId = _params.elemId || '';
                delete _params.elemId;
            }
        }
        // 如果custom的参数中有elemId也把它提取到头部elemId中
        if (_event == 'custom' && _params.elemId) {
            _elemId = _params.elemId || '';
            delete _params.elemId;
        }

        // 默认日志标签是weblog, 这种情况elk不解析extend
        // 需要解析extend的地方可以指定为json_tag
        // weblog: 默认标签, json_tag: weblog需要解析json, visible: 可视化回溯专用
        var _tag = '';
        for (var i = 0; i < _jsonTag.length; i++) {
            if (_jsonTag[i].event === _event && _jsonTag[i].msg === _name) {
                _tag = 'json_tag';
                break;
            }
        }
        // 可视化回溯日志固定用visible
        if (_name.indexOf('VISIBLE_TRACEBACK_') >= 0) {
            _tag = 'visible';
        }

        var _query = _parseQuery(_pageHis.cur.query) || {};
        var _item = {
            // 可回溯日志单独存一份, 不影响sequenceId
            sequenceID: _tag === 'visible' ? _config.sequenceId : ++_config.sequenceId,
            // productCode: '',
            // 当前页面的url与query
            pageID: _pageHis.cur.url || '',
            query: _pageHis.cur.query || '',
            event: _event || '',
            message: _name || '',
            elementID: _elemId,
            fromURL: _pageHis.from.url || '',
            fromQuery: _pageHis.from.query || '',
            toURL: _pageHis.to.url || '',
            toQuery: _pageHis.to.query || '',
            h5URL: '',
            h5Version: '',
            // 外部渠道号
            wtag: _config.wtagid || '',
            // 内部渠道号
            channel: _config.channel || '',
            extend: {
                tag: _tag,
                utc: Date.now(),
                activeId: _config.options && _config.options.activeId || '',
                sequenceId0: _config.sequenceId0,
                options: _config.options,
                params: _params
            }
        };
        // onLoad事件多上报一个document.referrer
        if (_event == 'onLoad') {
            _item && _item.extend && (_item.extend.referrer = document.referrer || '');
        }
        // click事件不需要上报from, to参数
        if (_event == 'click') {
            _item.fromURL = '';
            _item.fromQuery = '';
            _item.toURL = '';
            _item.toQuery = '';
        }
        var _body = {
            reportTime: _utcToYMD(Date.now()) + new Date().getMilliseconds(),
            source: _config.source[1],
            scene: _config.scene,
            ua: '',
            deviceId: _getDeviceId(),
            items: [_item]
        };
        var _rid = _paddingNumber(_toHexadecimal(Math.random() * (Math.pow(16, 8) - 1)), 8);
        // 最终上报数据
        var _data = {
            requestId: _rid,
            // 非微信: h5-normal, 公众号: 默认h5-gzh, 开发者可在初始化时配置覆盖, 小程序: 真实appid
            appId: _config.options.appId || 'h5-normal',
            // h5没有token, 全用无登录态模式
            cmd: 'White',
            sessionId: _config.sessionId,
            userId: _config.options.openId || '',
            token: location.host || '',
            // token: 'www.wesure.cn',
            version: _config.options.version || '',
            body: _body
        };

        return _data;
    };

    // 初始化只执行一次
    var _initFlag = false;
    var _reportEvent = {
        // 特殊情况需要单独更新openId
        updateOpenId: function(_openId) {
            _openId && (_config.options.openId = _openId);
        },
        // 特殊情况需要单独更新activeId
        updateActiveId: function(_activeId) {
            _activeId && (_config.options.activeId = _activeId);
        },
        init: function(_options) {
            if (_initFlag) {
                return;
            }
            _initFlag = true;
            if (_options) {
                _config.debug = _options.debug || false;
                _config.env = _getEnv();
                _config.reportUrl = _getReportUrl();

                // 如果是prd则不打印日志
                if (_config.env == 'prd') {
                    console.log = function() {};
                    console.warn = function() {};
                    console.error = function() {};
                }

                console.log('-----init-----', _options);
                if (_options.h5Type && _options.version) {
                    // 小程序传过来的参数
                    // 把query中的这些值存下来 appId, wtagid, channel, openId, sessionId, sequenceId
                    var _query = _parseQuery();
                    _config.appId = _query.appId || '';
                    _config.activeId = _query.activeId || '';
                    _config.wtagid = _query.wtagid || '';
                    _config.scene = _query.scene || '';
                    _config.channel = _query.channel || '';
                    _config.openId = _query.openId || '';
                    _config.sessionId = _query.sessionId || '';
                    _config.sequenceId0 = _query.sequenceId || 0;
                    // 非微信: h5-normal, 公众号: 默认h5-gzh, 开发者可在初始化时配置覆盖, 小程序: 真实appid
                    // 有传值进来直接用, 没有的话判断是否微信环境
                    if (!_config.appId) {
                        if (_ifWeixn()) {
                            _config.appId = 'h5-gzh';
                        } else {
                            _config.appId = 'h5-normal';
                        }
                    }

                    // 初始化配置
                    _config.options.appId = _options.appId || _config.appId || '';
                    _config.options.activeId = _options.activeId || _config.activeId || '';
                    _config.options.openId = _options.openId || _config.openId || '';
                    _config.options.h5Type = _options.h5Type;
                    _config.options.version = _options.version;
                    _config.options.spa = _options.spa || false;
                    _config.options.debug = _options.debug || false;
                    _config.options.sendBeacon = _options.sendBeacon || false;


                    _config.scale = window.innerWidth / 750;
                    // 必须调用了init方法才可以使用日志上报
                    _config.ready = true;
                    _updatePageHis({
                        event: 'enterPage'
                    });
                    // 如果是SPA就让开发者自己控制上报页面的onshow和onhide事件
                    if (!_config.options.spa) {
                        _reportEvent.enterPage();
                    }
                    // 初始化上报一次ua及其他选项
                    _reportEvent.reportEvent('onLoad', 'enterApp', {
                        url: location.href,
                        options: _config.options,
                        ua: navigator.userAgent
                    });
                    // 监听事件
                    _initEvent();
                } else {
                    console.error('必须指定h5类型与版本号');
                }
            } else {
                console.log('init必须指定参数');
            }
        },
        // 手动触发页面事件, 用于SPA页面
        // _url, _query: 当前页面的参数, 可缺省
        enterPage: function(_url, _query) {
            _query = _stringifyQuery(_query);
            _updatePageHis({
                event: 'enterPage',
                url: _url || '',
                query: _query || ''
            });
            _reportEvent.reportEvent('onShow', 'enterPage');
        },
        // _toUrl, _toQuery: 目标页面的参数, 缺失不报错, 但不应该缺失
        leavePage: function(_toUrl, _toQuery) {
            _toQuery = _stringifyQuery(_toQuery);
            _updatePageHis({
                event: 'leavePage',
                toUrl: _toUrl || '',
                toQuery: _toQuery || ''
            });
            _reportEvent.reportEvent('onHide', 'leavePage', _getPageStayTime());
        },
        getDeviceId: _getDeviceId,
        // 用户行为数据上报
        // event: 事件类型, 枚举: onLoad\onShow\onHide\onUnload\click\custom
        // name: 事件名
        // params: 额外参数
        reportEvent: function(_event, _name, _params, _cbSuccess, _cbFail) {
            var _data = _buildData(_event, _name, _params, _cbSuccess, _cbFail);
            if (_data && _data.body) {
                // 队列有可能在页面关闭时导致更大的数据丢失, 所以h5上暂时不用队列, 直接上报
                // _addToQueue(_data, _cbSuccess);
                _request(_data, _cbSuccess);
            }
        },
        // 为了防止数据丢失, h5日志默认场景都不使用队列
        // 另外增加了reportEventList接口, 使用此接口的会使用队列, 但不延时, 队列数据处理完就立即reportAllQueue上报队列, 保证数据不丢失
        // 一次上报多条数据, 参数是事件列表 
        // [
        //     [_event, _name, _params]
        // ]
        reportEventList: function(_eventList, _cbSuccess, _cbFail) {
            if (_eventList && _eventList.length) {
                for (var i = 0; i < _eventList.length; i++) {
                    var _event = _eventList[i];
                    if (_event && _event.length) {
                        var _data = _buildData(_event[0], _event[1], _event[2]);
                        if (_data && _data.body) {
                            _addToQueue(_data);
                        }
                    }
                }
                _reportEvent.reportAllQueue();
            }
        },
        // 把队列中的所有数据上报, 这里直接上报, 判断是否上报的逻辑由调用者处理
        reportAllQueue: function() {
            if (_reportQueue && _reportQueue.length > 0) {
                // 以最新的一个日志为基础
                var _data = JSON.parse(JSON.stringify(_reportQueue[_reportQueue.length - 1]));
                if (_data && _data.body && _data.body.items) {
                    _data.body.items = [];
                    // 补上userId(net在h5上取不到)
                    for (var i = 0; i < _reportQueue.length; i++) {
                        if (_reportQueue[i] && _reportQueue[i].body && _reportQueue[i].body.items[0]) {
                            _reportQueue[i].body.items[0].userID = _config.options.openId || '';
                            _data.body.items.push(_reportQueue[i].body.items[0]);
                        }
                    }
                    _reportQueue = [];

                    // 如果不是登录态就走白名单路径
                    _request(_data);
                } else {
                    console.error('数据错误', _data);
                }
            }
        }
    };

    // 可视化回溯相关
    (function() {
        // 可视化回溯使用单独的sequenceId与sessionId
        var _visible = {
            // location.href
            url: '',
            // 可视化录屏是否正在记录中
            recording: false,
            // 可视化回溯事件单独再记录一套sequenceId
            sequenceId: 0,
            // 使用单独的sessionId, 以处理一次购买多个保单的场景, 
            // 在一个生命周期中可能购买多个保单, 不同保单都需要重新start生成新的sessionId
            sessionId: ''
        };
        
        // 以下是对外接口
        // 开始视频回溯记录
        // h5需要在启动时将所有滚动元素的id传入
        _reportEvent.start = function(_scrollIds) {
            _visible.sessionId = _getSessionId();
            _reportEvent.reportEvent('custom', 'VISIBLE_TRACEBACK_START', {
                sessionId: _visible.sessionId,
                // 记录启动前的状态, 如果没有正常调用stop, 这里的sequenceId就不是0
                sequenceId: _visible.sequenceId,
                recording: _visible.recording,
                ua: navigator.userAgent
            });
            _visible.recording = true;
            _visible.sequenceId = 1;
            _reportEvent.timer();
            // 启动后及立即保存一个快照
            _reportEvent.save();
            // 页面css, 一个页面只需要存一份
            _css.initCSS(function(_cssData) {
                _save('CSS', _cssData);
            });
        };
        // 停止视频回溯记录, 跟start必须配对
        _reportEvent.stop = function() {
            // 结束前先保存一个快照
            _reportEvent.save();
            // 页面css, 一个页面只需要存一份, 为了冗余处理, stop也存一份
            _css.initCSS(function(_cssData) {
                _save('CSS', _cssData);
            });
            _reportEvent.reportEvent('custom', 'VISIBLE_TRACEBACK_STOP', {
                sessionId: _visible.sessionId,
                // 记录结束前状态
                sequenceId: _visible.sequenceId,
                recording: _visible.recording,
                ua: navigator.userAgent
            });
            _visible.recording = false;
            _visible.sequenceId = 0;
            _visible.sessionId = '';
        };
        // 视频回溯保存指令, 记录当时的页面状态
        _reportEvent.save = (function() {
            // 获取页面滚动位置方法, 需返回两个方向的滚动参数 {x: 0, y: 0}
            // 也可以只返回y值, 这种情况就默认x为0
            var getScrollPos = '';
            var setScrollPos = '';
            retrun (function(_getScrollPos, _setScrollPos) {
                if (_config.recording) {
                    // 滚动条的获取及设置方法只需设置一次, 后面会继续复用
                    // 传入的参数是方法字符串, 因为日志只能存字符串
                    _getScrollPos && (getScrollPos = _getScrollPos);
                    _setScrollPos && (setScrollPos = _setScrollPos);
                    // 滚动位置
                    var _scrollPos = null;
                    try {
                        // 这里存的是字符串, 所以需要用eval执行
                        // eval执行代码有比较大的安全风险, 需要考虑解决方案
                        _scrollPos = getScrollPos && eval(getScrollPos) || null;
                        if (typeof _scrollPos === 'number') {
                            _scrollPos = {x: 0, y: _scrollPos};
                        }
                    } catch (_err) {
                        console.error(_err);
                    }
                    // 以自定义类型上报, 可视化数据存在扩展字段中
                    _reportEvent.reportEvent('custom', 'VISIBLE_TRACEBACK_SAVE', {
                        // 可视化回溯单独记录一套sessionId和sequenceId, 从1开始, 只在start时刷新
                        sequenceId: _visible.sequenceId++,
                        sessionId: _visible.sessionId,
                        // 记录页面地址, 用来查找对应代码, 不需要记录query, 额外的参数可通过weblog获取
                        url: location.origin + location.pathname,
                        // 静态页面html字符串, 只用于h5, 小程序留空
                        html: _clearHtml(document.body.innerHTML),
                        // 页面与组件数据字符串, 只用于小程序, h5留空
                        data: null
                    });
                } else {
                    console.error('需要先调用start启动回溯记录');
                }
            });
        })();


        // 以下是内部方法
        // 记录滚动位置及CSS, 保存位置同save方法, 不过此方法由SDK调用, 不对外
        var _save = (function() {
            return (function(_type, _value) {
                switch (_type) {
                    case 'CSS':
                        // 以自定义类型上报, 可视化数据存在扩展字段中
                        _reportEvent.reportEvent('custom', 'VISIBLE_TRACEBACK_SAVE', {
                            // 可视化回溯单独记录一套sequenceId, 从1开始, 只在start时刷新, sessionId刷新时, 此参数也不复位, 可以此判断会话间隔
                            sequenceId: _visible.sequenceId++,
                            sessionId: _visible.sessionId,
                            // 记录页面地址, 用来查找对应代码, 不需要记录query, 额外的参数可通过weblog获取
                            url: _value.url,
                            // 静态页面css字符串, 用于h5, 小程序留空
                            css: _value.css,
                            // 同时记录屏幕尺寸, 还原时使用
                            windowSize: [_value.screenX, _value.screenY]
                        });
                        break;
                    case 'SCROLL':
                        // 以自定义类型上报, 可视化数据存在扩展字段中
                        _reportEvent.reportEvent('custom', 'VISIBLE_TRACEBACK_SAVE', {
                            // 可视化回溯单独记录一套sequenceId, 从1开始, 只在start时刷新, sessionId刷新时, 此参数也不复位, 可以此判断会话间隔
                            sequenceId: _visible.sequenceId++,
                            sessionId: _visible.sessionId,
                            // 记录页面地址, 用来查找对应代码, 不需要记录query, 额外的参数可通过weblog获取
                            url: location.origin + location.pathname,
                            // 滚动位置数据, 允许有多个滚动条, 需提供滚动条id, 如果没提供的话就默认用window.scrollY
                            scroll: {
                                'id1': {
                                    x: window.scrollX || 0,
                                    y: window.scrollY || 0
                                },
                                'id2': {
                                    x: window.scrollX || 0,
                                    y: window.scrollY || 0
                                }
                            }
                        });
                        break;
                }
            });
        })();

        // 定时器, 用来扫描滚动位置, 同时自动获取html
        var _timer = (function() {
            return (function() {
                setTimeout(function() {
                    if (_config.recording) {
                        _timer();
                    }
                }, 500);
            });
        })();

        // 去掉不显示的节点及script
        var _clearHtml = (function() {
            // 移除script与link节点
            var _removeTagList = ['script', 'link'];
            var _getAllStyle = function(_tmpDom) {
                if (_tmpDom) {
                    var _children = _tmpDom.children;
                    if (_children) {
                        for (var i = 0; i < _children.length; i++) {
                            if (_children[i]) {
                                var _tagName = _children[i].tagName.toLowerCase() || '';
                                if (_children[i].style.display === 'none' || _removeTagList.indexOf(_tagName) >= 0) {
                                    _tmpDom.removeChild(_children[i]);
                                    i--;
                                } else {
                                    _getAllStyle(_children[i]);
                                }
                            }
                        }
                    }
                }
            };
            return (function(_html) {
                var _t0 = Date.now();
                var _tmpDom = document.createElement('div');
                _tmpDom.style.display = 'none';
                _tmpDom.innerHTML = _html;
                _getAllStyle(_tmpDom);
                return _tmpDom.innerHTML;
            });
        })();

        // <!-- 规定禁止使用反斜杠， 相对路径以./或者../开头， @import引入绝对路径时会忽略该文件-->
        //  多个link统一写在style标签前面
        var _css = {
            css: '',
            url: '',
            screenX: '',
            screenY: '',
            reqNum: [],
            linkNum: 0,
            linkQue: []
            initCSS(callback) {
                _css.css = '';
                _css.url = location.href;
                _css.screenX = screen.width;
                _css.screenY = screen.height;
                _css.callback = callback;
                var links = document.getElementsByTagName('link');
                var cssHref = [];
                for(var j = 0; j < links.length; j++) {
                    var link = links[j];
                    if (link.rel === 'stylesheet') {
                        cssHref.push(link.href);
                    }
                }
                for (var i = 0; i < cssHref.length; i++) {
                    _css.reqNum[i] = 0;
                    _css.linkNum++;
                    var url = cssHref[i];
                    var baseUrl = _css.getBaseUrl(url);
                    _css.linkQue[i] = {};
                    _css.getCSS(url, baseUrl, _css.linkQue[i], i);
                }
            },

            getCSS(url, baseUrl, cssStruct, i) {
                // url为绝对路径
                _css.reqNum[i]++;
                var relativeUrlArr = [];
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        var data = xhr.responseText;
                        cssStruct[url] = {
                            cssText: data,
                            children: []
                        };
                        _css.reqNum[i]--;
                        relativeUrlArr = _css.importUrl(data);
                        if (relativeUrlArr.length !== 0) {
                            for (var j = 0; j < relativeUrlArr.length; j++) {
                                var reqUrl = _css.repairUrl(baseUrl, relativeUrlArr[j][2]);
                                var reqBaseUrl = _css.getBaseUrl(reqUrl);
                                _css.getCSS(reqUrl, reqBaseUrl, cssStruct[url]['children'][j] = {}, i);
                            }
                        }
                        if (_css.reqNum[i] == 0) {
                            _css.linkNum--;
                        }
                        if (_css.linkNum == 0) {
                            for (var k = 0; k < _css.linkQue.length; k++) {
                                var key = Object.getOwnPropertyNames(_css.linkQue[k])[0];
                                var tmp = _css.getStringCSS(_css.linkQue[k][key]);
                                _css.css = _css.css + '\n' + tmp;
                            }
                            _css.css = _css.css.replace(/@import[^;]*;/g, "");
                            console.log(_css.css);
                            _css.callback && _css.callback({
                                css: _css.css,
                                url: _css.url,
                                screenX: _css.screenX,
                                screenY: _css.screenY
                            });
                        }
                    }
                }
                xhr.open('GET', url, true);
                xhr.send(null);
            },

            getStringCSS(obj) {
                if (obj.children && obj.children.length > 0) {
                    for (var i = 0; i < obj.children.length; i++) {
                        var key = Object.getOwnPropertyNames(obj.children[i]);
                        var tmp = _css.getStringCSS(obj.children[i][key]);
                        _css.css = _css.css + '\n' + tmp;
                    }
                    return obj.cssText;
                } else {
                    return obj.cssText;
                }
            },

            repairUrl(baseUrl, relativeUrl) {
                if (_css.isAbsolute(relativeUrl)) {
                    console.warn(baseUrl + '中使用了绝对路径' + relativeUrl);
                    return false;
                }
                var backPathLevel = relativeUrl.match(/\.\.\//g);
                if (backPathLevel === null) {
                    return baseUrl + relativeUrl.substr(1);
                } else {
                    var path = baseUrl.split("/");
                    for (var i = 0; i < backPathLevel.length; i++) {
                        path.pop();
                    }
                    relativeUrl = relativeUrl.replace(/\.\.\//g, "");
                    return path.join("/") + '/' + relativeUrl;
                }
            },

            importUrl(data) {
                //  提取url
                var r = /@import[^'"]*(['"])([\S]*)\1[^"']*\;/g;
                var url = [];
                while (true) {
                    var flag = r.exec(data);
                    if (!flag) {
                        break;
                    }
                    url.push(flag);
                }
                return url;
            },

            isAbsolute(url) {
                return /(^[\/\\].*)|(.*:.*)/.test(url);
            },

            getBaseUrl(url) {
                return url.replace(/\/[^\/]+\.css/, "");
            },

            report(data, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (callback) {
                            callback();
                        }
                    }
                };
                xhr.open('POST', '/recordCSS', true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(data));
            }
        };
    })();

    return _reportEvent;
})();


// export default reportEvent;
