const locations = require("../../contants/location.js");

Page({
    data: {
        locations,
        tabActive: 999
    },

    onChange(event) {
        this.setData({
            result: event.detail
        });
    },
});