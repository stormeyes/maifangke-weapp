Page({
    data: {
        show: false,
        actions: [
            {
                name: '选项'
            },
            {
                name: '选项'
            },
            {
                name: '选项',
                subname: '副文本',
                openType: 'share'
            }
        ]
    },

    onClose() {
        this.setData({ show: false });
    },

    onSelect(event) {
        console.log(event.detail);
    },
    showPopup(event) {
        this.setData({ show: true });
    }
});