var scrollReport = {
    scrollElement: {},
    previousEvent: {},
    seqId: 0,
    needReport: false,
    reportEvent(callback) {
        this.callback = callback;
        var self = this;
        setTimeout(function () {
            self.diff();
            if (self.needReport) {
                var result = {
                    "scroll": self.scrollElement,
                    "sequenceId": self.seqId,
                    'utc': Date.now(),
                    "location": location.origin + location.pathname
                }
                console.log(result)
                self.report(result, this.callback);
                self.seqId++;
                Object.assign(self.previousEvent, self.scrollElement);
            }
            self.reportEvent(callback);
        }, 500)
    },

    diff() {
        if (this.isObjectValueChange(this.previousEvent, this.scrollElement)) {
            this.needReport = true;
        } else {
            this.needReport = false;
        }
    },

    listenScroll(idArr = []) {
        var self = this;
        if (!Array.isArray(idArr)) {
            return false
        }

        // if (idArr.length == 0) {
        window.addEventListener('scroll', function (e) {
            self.scrollElement['window'] = {
                y: Math.floor(window.scrollY),
                x: Math.floor(window.scrollX),
            }
        })
        // }

        for (var i = 0; i < idArr.length; i++) {
            console.log('start listen scroll' + idArr[i]);
            var element = document.getElementById(idArr[i]);

            (function (closeId, element) {
                console.log(closeId)
                element.addEventListener('scroll', function (e) {
                    self.scrollElement[closeId] = {
                        y: Math.floor(element.scrollTop),
                        x: Math.floor(element.scrollLeft),
                    }
                })
            })(idArr[i], element)
        }
    },

    isObjectValueChange(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) {
            return true;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            var {
                x: propAX,
                y: propAY
            } = a[propName];
            var {
                x: propBX,
                y: propBY
            } = b[propName];
            var diffX = Math.abs(propAX - propBX);
            var diffY = Math.abs(propAY - propBY);
            if (diffX > 10 || diffY > 10) {
                return true;
            }
        }
        return false;
    },

    report(data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (callback) {
                    callback()
                }
            }
        }
        xhr.open('POST', '/recordScroll', true)
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
}