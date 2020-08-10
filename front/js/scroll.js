var scrollReport = {
    scrollElement: {},
    previousEvent: {},
    seqId: 0,
    needReport: false,
    reportEvent(report) {
        var self = this;
        setTimeout(function () {
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
            self.reportEvent(report);
        }, 500)
    },

    diff() {
        if (this.isObjectValueChange(this.previousEvent, this.scrollElement)) {
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
        for (var i=0;i<idArr.length;i++) {
            console.log('start listen scroll' + idArr[i]);
            var element = document.getElementById(idArr[i]);
            (function(closeId){
                element.addEventListener('scroll', function (e) {
                    self.scrollElement[closeId] = {
                        y: Math.floor(element.scrollTop),
                        x: Math.floor(element.scrollLeft),
                    }
                })
            })(idArr[i])            
        }
    },

    isObjectValueChange(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (aProps.length != bProps.length) {
            return false;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            var {x:propAX, y:propAY} = a[propName];
            var {x:propBX, y:propBY} = b[propName];
            var diffX = Math.abs(propAX - propBX);
            var diffY = Math.abs(propAY - propBY);
            if (diffX > 10 || diffY > 10) {
                return false;
            }
        }
        return true;
    }
}