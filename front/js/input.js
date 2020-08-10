var inputReport = {
    result: {
        html: '',
        sequenceId:0,
    },
    getHTML(report) {
        this.result.html = document.getElementsByTagName('html')[0].innerHTML;
        report(this.result);
        this.result.sequenceId++;
    },
    listenInput() {
        window.addEventListener('input', function (e) {
            switch (e.target.nodeName) {
                case 'TEXTAREA':
                    var input = e.target;
                    input.setAttribute('placeholder', input.value);
                    break;
                case 'INPUT':
                    var input = e.target;
                    switch (input.type) {
                        case 'text':
                            input.setAttribute('value', input.value);
                            break;
                        case 'checkbox':
                        case 'radio':
                            input.setAttribute('checked', 'checked')
                            break;
                    }
                    break;
                case 'SELECT':
                    var select = e.target;
                    var options = select.children;
                    for(var i=0;i<options.length;i++) {
                        if (options[i].value === select.value) {
                            options[i].setAttribute('selected', 'selected');
                            break
                        }
                    }
                    break;
            }
        })
    }
}