// <!-- 规定禁止使用反斜杠， 相对路径以./或者../开头， @import引入绝对路径时会忽略该文件-->
//  多个link应该写在一起
var cssReport = {
    css: "",
    cssStruct: {},
    reqNum : 0,
    linkNum : 0,
    initCSS() {
        var links = Array.from(document.getElementsByTagName('link'))
        var cssLinks = links.filter(function (v, i) {
            return v.rel === 'stylesheet' ? true : false;
        });
        var cssHref = cssLinks.map((v) => {
            return v.href
        });

        let linkQue = []
        // for (let url of cssHref) {
        for (let i=0;i<cssHref.length;i++) {   
            let url = cssHref[i]; 
            let baseUrl = this.getBaseUrl(url)
            this.cssStruct[url] = {}
            linkQue[i] = this.getCSS(url, baseUrl, this.cssStruct[url]).then();
        }
        return Promise.all(linkQue).then((data) => {
            this.css = data.join("\n");
            return data.join("\n");
        })
    },

    getCSS(url, baseUrl, cssStruct) {
        // url为绝对路径
        this.reqNum++;
        var relativeUrlArr = []
        return fetch(url, {
                method: "GET",
            })
            .then((response) => {
                return response.text();
            })
            .then(data => {
                cssStruct[url] = {
                    cssText: data,
                    children: [],
                };
                this.reqNum--;
                relativeUrlArr = this.importUrl(data);
                if (relativeUrlArr.length !== 0) {
                    // for (let relativeUrl of relativeUrlArr) {
                    for (let i=0;i<relativeUrlArr.length;i++) {
                        let reqUrl = this.repairUrl(baseUrl, relativeUrlArr[i][2]);
                        let reqBaseUrl = this.getBaseUrl(reqUrl);
                        this.getCSS(reqUrl, reqBaseUrl, cssStruct[url]['children'][i]={})
                    }
                    // return Promise.all(reqQueue).then((r) => {
                    //     data = data.replace(/@import[^;]+\;/g, "")
                    //     return r.join("\n") + data
                    // })
                }
            }).then((r)=>{
                if(this.reqNum == 0){
                    console.log(this.cssStruct)
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