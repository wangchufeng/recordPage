var js = {
    html: '',
    getHTML() {
        this.html = document.getElementsByTagName('html')[0];
    },
    listenInput() {
        window.addEventListener('input', function (e) {
            // console.log(e.target.nodeName)
            switch (e.target.nodeName) {
                case 'TEXTAREA':
                    var input = e.target;
                    input.setAttribute('placeholder', input.value);
                    console.log(html.innerHTML)
                    break;
                case 'INPUT':
                    var input = e.target;
                    switch (input.type) {
                        case 'text':
                            input.setAttribute('value', input.value);
                            console.log(html.innerHTML)
                            break;
                        case 'checkbox':
                        case 'radio':
                            input.setAttribute('checked', 'checked')
                            console.log(html.innerHTML)
                            break;
                    }
                    break;
                case 'SELECT':
                    var select = e.target;
                    console.log(select.value)
                    var options = select.children;
                    for (let option of options) {
                        if (option.value === select.value) {
                            option.setAttribute('selected', 'selected');
                            break
                        }
                    }
                    console.log(html.innerHTML)
                    break;
            }
        })
    }
}