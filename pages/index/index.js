const locations = require("../../contants/location.js");

Page({
    data: {
        locations,
        tabActive: 999,
        plain: true,
        list: ['单间', '一房', '两房', '三房', '四房', '四房+'],
        result: ['a', 'b']
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