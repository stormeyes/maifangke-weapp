const locations = require("../../contants/location.js");

Page({
    data: {
        locations,
        tabActive: 999,
        plain: true,
        list: ['单间', '一房', '两房', '三房', '四房', '四房+'],
        result: ['a', 'b']
    },

    onLoad() {
        wx.cloud.init({env: "debug-enbxd"})
        wx.cloud.callFunction({
            // 云函数名称
            name: 'query_house',
            // 传给云函数的参数
            data: {
                a: 1,
                b: 2,
            },
        })
            .then(res => {
                console.log(res) // 3
            })
            .catch(console.error)
    },

    onChange(event) {
        this.setData({
            result: event.detail
        });
    },

    onBtnClick() {
        this.setData({plain: !this.data.plain})
    },

    toggle(event) {
        const { index } = event.currentTarget.dataset;
        const checkbox = this.selectComponent(`.checkboxes-${index}`);
        checkbox.toggle();
    },

    noop() {}
});