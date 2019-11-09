Page({
    onLoad: function (option) {
        console.log(option.query)
        const eventChannel = this.getOpenerEventChannel()
    }
})