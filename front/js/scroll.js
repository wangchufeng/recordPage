var scrollReport = {
    scrollElement: {},
    previousEvent: {},
    seqId: 0,
    needReport: false,
    reportEvent() {
        var self = this;
        setTimeout(function () {
            self.diff();
            if (self.needReport) {
                var result = {
                    'scroll': self.scrollElement,
                    'sequenceId': self.seqId,
                    'utc': Date.now(),
                    'location': location.origin + location.pathname
                };
                console.log(result);
                self.report(result);
                self.seqId++;
                self.previousEvent = self.shallowCopy(self.scrollElement);
                // Object.assign(self.previousEvent, self.scrollElement);
            }
            self.reportEvent();
        }, 500);
    },

    shallowCopy(src) {
        var dst = {};
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                dst[prop] = src[prop];
            }
        }
        return dst;
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

        if (Object.prototype.toString.call(idArr) !== '[object Array]') {
            return false;
        }

        function windowScrollEvent() {
            scrollReport.scrollElement['window'] = {
                y: Math.floor(window.scrollY),
                x: Math.floor(window.scrollX)
            };
        }
        window.removeEventListener('scroll', windowScrollEvent);
        window.addEventListener('scroll', windowScrollEvent);

        for (var i = 0; i < idArr.length; i++) {
            console.log('start listen scroll' + idArr[i]);
            var element = document.getElementById(idArr[i]);
            element.removeEventListener('scroll', self.scrollEventCallback);
            element.addEventListener('scroll', self.scrollEventCallback);
        }
    },

    scrollEventCallback(e) {
        var element = e.target;
        var closeId = element.id;
        scrollReport.scrollElement[closeId] = {
            y: Math.floor(element.scrollTop),
            x: Math.floor(element.scrollLeft)
        };
    },

    isObjectValueChange(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) {
            return true;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            var propAX = a[propName]['x'];
            var propAY = a[propName]['y'];
            var propBX = b[propName]['x'];
            var propBY = b[propName]['y'];
            var diffX = Math.abs(propAX - propBX);
            var diffY = Math.abs(propAY - propBY);
            if (diffX > 10 || diffY > 10) {
                return true;
            }
        }
        return false;
    },

    report(data) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log('upload success');
            }
        };
        xhr.open('POST', '/recordScroll', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
};