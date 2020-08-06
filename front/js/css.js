// <!-- 规定禁止使用反斜杠， 相对路径以./或者../开头， @import引入绝对路径时会忽略该文件-->
//  多个link应该写在一起
var css = {
    css: "",
    initCSS() {
        var links = Array.from(document.getElementsByTagName('link'))
        var cssLinks = links.filter(function (v, i) {
            return v.rel === 'stylesheet' ? true : false;
        });
        var cssHref = cssLinks.map((v) => {
            return v.href
        });

        let linkQue = []
        for (let url of cssHref) {
            let baseUrl = this.getBaseUrl(url)
            linkQue.push(this.getCSS(url, baseUrl));
        }
        return Promise.all(linkQue).then((data) => {
            this.css = data.join("\n");
            return data.join("\n");
        })
    },

    getCSS(url, baseUrl) {
        // url为绝对路径
        var relativeUrlArr = []
        return fetch(url, {
                method: "GET",
            })
            .then((response) => {
                return response.text();
            })
            .then(data => {
                relativeUrlArr = this.importUrl(data);
                if (relativeUrlArr.length !== 0) {
                    let reqQueue = []
                    for (let relativeUrl of relativeUrlArr) {
                        let reqUrl = this.repairUrl(baseUrl, relativeUrl[2]);
                        let reqBaseUrl = this.getBaseUrl(reqUrl);
                        reqQueue.push(this.getCSS(reqUrl, baseUrl));
                    }
                    return Promise.all(reqQueue).then((r) => {
                        data = data.replace(/@import[^;]+\;/g, "")
                        return r.join("\n") + data
                    })
                } else {
                    return data
                }
            });
    },

    repairUrl(baseUrl, relativeUrl) {
        if (this.isAbsolute(relativeUrl)) {
            console.warn(baseUrl + '中使用了绝对路径' + relativeUrl);
            return false;
        }
        // console.log('relativeUrl:',relativeUrl)
        var backPathLevel = relativeUrl.match(/\.\.\//g);
        if (backPathLevel === null) {
            return baseUrl + relativeUrl.substr(1);
        } else {
            let path = baseUrl.split("/");
            for (let i = 0; i < backPathLevel.length; i++) {
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
        // localhost:5500/css
        return url.replace(/\/[^\/]+\.css/, "");
    }
}