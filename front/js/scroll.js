var scrollReport = {
    scrollElement: {},
    previousEvent: {},
    seqId: 0,
    needReport: false,
    reportEvent(report) {
        let self = this;        
        setInterval(function () {
            self.diff();
            if (self.needReport) {
                var result = {
                    "scroll": self.scrollElement,
                    "seqId": self.seqId,
                    "location": location.origin + location.pathname
                }
                report(result);
                self.seqId++;
                Object.assign(self.previousEvent, self.scrollElement);
            }
        }, 500)
    },

    diff() {
        if (this.isObjectValueEqual(this.previousEvent, this.scrollElement)) {
            this.needReport = false;
        } else {
            this.needReport = true;
        }
    },

    listenScroll(idArr) {
        var self = this;
        if (!Array.isArray(idArr)) {
            return false
        }
        console.log('start listen scroll')
        for (let id of idArr) {
            console.log('start listen scroll' + id);
            let element = document.getElementById(id);
            element.addEventListener('scroll', function (e) {
                self.scrollElement[id] = element.scrollTop;
            })
        }
    },

    isObjectValueEqual(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) {
            return false;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            var propA = a[propName];
            var propB = b[propName];
            if (propA !== propB) {
                return false;
            }
        }
        return true;
    }
}