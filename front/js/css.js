// <!-- 规定禁止使用反斜杠， 相对路径以./或者../开头， @import引入绝对路径时会忽略该文件-->
//  多个link统一写在style标签前面
var cssReport = {
    css: "",
    reqNum: [],
    linkNum: 0,
    linkQue: [],
    location: '',
    screenX: '',
    screenY: '',
    initCSS(callback) {
        this.callback = callback;
        var links = Array.from(document.getElementsByTagName('link'))
        var cssLinks = links.filter(function (v, i) {
            return v.rel === 'stylesheet' ? true : false;
        });
        var cssHref = cssLinks.map((v) => {
            return v.href;
        });
        for (var i = 0; i < cssHref.length; i++) {
            this.reqNum[i] = 0;
            this.linkNum++;
            var url = cssHref[i];
            var baseUrl = this.getBaseUrl(url);
            this.linkQue[i] = {};
            this.getCSS(url, baseUrl, this.linkQue[i], i);
        }
    },

    getCSS(url, baseUrl, cssStruct, i) {
        // url为绝对路径
        var self = this;
        this.reqNum[i]++;
        var relativeUrlArr = [];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var data = xhr.responseText;
                cssStruct[url] = {
                    cssText: data,
                    children: [],
                };
                self.reqNum[i]--;
                relativeUrlArr = self.importUrl(data);
                if (relativeUrlArr.length !== 0) {
                    for (var j = 0; j < relativeUrlArr.length; j++) {
                        var reqUrl = self.repairUrl(baseUrl, relativeUrlArr[j][2]);
                        var reqBaseUrl = self.getBaseUrl(reqUrl);
                        self.getCSS(reqUrl, reqBaseUrl, cssStruct[url]['children'][j] = {}, i);
                    }
                }
                if (self.reqNum[i] == 0) {
                    self.linkNum--;
                }
                if (self.linkNum == 0) {
                    for (var k = 0; k < self.linkQue.length; k++) {
                        var key = Object.getOwnPropertyNames(self.linkQue[k])[0];
                        var tmp = self.getStringCSS(self.linkQue[k][key]);
                        self.css = self.css + '\n' + tmp;
                    }
                    self.css = self.css.replace(/@import[^;]*;/g, "");
                    console.log(self.css);
                    self.report({
                        css: self.css
                    }, self.callback);
                }
            }
        }
        xhr.open('GET', url, true);
        xhr.send(null);
    },

    getStringCSS(obj) {
        if (obj.children && obj.children.length > 0) {
            for (var i = 0; i < obj.children.length; i++) {
                var key = Object.getOwnPropertyNames(obj.children[i])
                var tmp = this.getStringCSS(obj.children[i][key])
                this.css = this.css + '\n' + tmp;
            }
            return obj.cssText
        } else {
            return obj.cssText;
        }
    },

    repairUrl(baseUrl, relativeUrl) {
        if (this.isAbsolute(relativeUrl)) {
            console.warn(baseUrl + '中使用了绝对路径' + relativeUrl);
            return false;
        }
        var backPathLevel = relativeUrl.match(/\.\.\//g);
        if (backPathLevel === null) {
            return baseUrl + relativeUrl.substr(1);
        } else {
            var path = baseUrl.split("/");
            for (var i = 0; i < backPathLevel.length; i++) {
                path.pop()
            }
            relativeUrl = relativeUrl.replace(/\.\.\//g, "")
            return path.join("/") + '/' + relativeUrl;
        }
    },

    importUrl(data) {
        //  提取url
        var r = /@import[^'"]*(['"])([\S]*)\1[^"']*\;/g
        var url = [];
        while (true) {
            var flag = r.exec(data)
            if (!flag) {
                break;
            }
            url.push(flag)
        }
        return url
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
                if(callback){
                    callback()
                }                
            }
        }
        xhr.open('POST', '/recordCSS', true)
        xhr.setRequestHeader('Content-Type', 'application/json');        
        xhr.send(JSON.stringify(data));
    }
}