var input = {
    html: '',
    getHTML() {
        this.html = document.getElementsByTagName('html')[0];
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
                    for (let option of options) {
                        if (option.value === select.value) {
                            option.setAttribute('selected', 'selected');
                            break
                        }
                    }
                    break;
            }
        })
    }
}