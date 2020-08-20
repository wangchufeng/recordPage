var inputReport = {
    commonStr: '',
    dataToReport: {
        html: '',
        utc: Date.now(),
        sequenceId: 0
    },
    previousHTML: '',
    getHTML() {
        var nowHTML = document.getElementsByTagName('html')[0].innerHTML;
        if (nowHTML !== this.previousHTML) {
            this.dataToReport.html = nowHTML;
            this.dataToReport.utc = Date.now();
            this.report(this.dataToReport);
            this.dataToReport.sequenceId++;
            this.previousHTML = nowHTML;
        }
    },
    listenInput() {
        var self = this;
        window.addEventListener('input', function (e) {
            var input = e.target;
            switch (e.target.nodeName) {
                case 'TEXTAREA':
                    input.setAttribute('placeholder', input.value);
                    break;
                case 'INPUT':
                    switch (input.type) {
                        case 'text':
                            input.setAttribute('value', input.value);
                            break;
                        case 'checkbox':
                        case 'radio':
                            input.setAttribute('checked', 'checked');
                            break;
                    }
                    break;
                case 'SELECT':
                    var select = e.target;
                    var options = select.children;
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].value === select.value) {
                            options[i].setAttribute('selected', 'selected');
                            break;
                        }
                    }
                    break;
            }
            self.getHTML();
        }, false);
    },
    report(data) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log('upload success');
            }
        };
        xhr.open('POST', '/recordHTML', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
};