var scroll = {
    offsetY: [],

    listenScroll() {
        window.addEventListener('scroll', function (e) {
            this.offsetY.push(window.pageYOffset)
        })
    }
}