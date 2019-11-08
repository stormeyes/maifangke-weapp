const locations = require("../../contants/location.js");
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';

Page({
    data: {
        q: undefined,
        locations,
        tabActive: 999,
        plain: true,
        rooms: [{ name: "单间", value: 0 }, { name: "一房", value: 1 }, { name: "两房", value: 2 }, { name: "三房", value: 3 }, { name: "四房", value: 4 }],
        priceRange: [
            {min:0, max:200}, {min:200, max:300}, {min:300, max:400}, {min:400, max:500}, {min:500, max:600}, {min:600, max:0}
        ],
        selectedPrices: [1, 3],
        selectedRooms: [],
        locationMainActiveIndex: 0,
        locationActiveIds: [],
        houses: [],
    },

    onLoad() {
        //this.onFetchHouse();
    },

    onBtnClick() {
        this.setData({
            plain: !this.data.plain
        })
    },

    toggle(event) {
        const {
            index
        } = event.currentTarget.dataset;
        const checkbox = this.selectComponent(`.checkboxes-${index}`);
        checkbox.toggle();
    },

    onClickNav({
        detail = {}
    }) {
        this.setData({
            locationMainActiveIndex: detail.index || 0
        });
    },

    onClickItem({
        detail = {}
    }) {
        const {
            locationActiveIds
        } = this.data;

        const index = locationActiveIds.indexOf(detail.id);
        if (index > -1) {
            locationActiveIds.splice(index, 1);
        } else {
            locationActiveIds.push(detail.id);
        }

        this.setData({
            locationActiveIds
        });
    },

    onFetchHouse() {
        const that = this;
        Toast.loading({
            mask: true,
            forbidClick: true,
            duration: 0,
            loadingType: "spinner",
            message: '加载中...',
            selector: '#custom-selector'
        });
        wx.cloud.init({
            env: "debug-enbxd"
        })
        wx.cloud.callFunction({
                name: 'query_house',
                data: {
                    locationIds: that.data.locationActiveIds,
                    q: that.data.q,
                    rooms: that.data.selectedRooms
                },
            })
            .then(res => {
                res.result.map(item => {
                    item.area = Math.ceil(item.area)
                    item.monthlyMortgage = item.monthlyMortgage.toFixed(1)

                    if (item.room == 1 && item.ting == 0) {
                        item.roomType = '单间';
                    } else {
                        item.roomType = `${item.room}房`;
                    }

                    if (item.loan) {
                        item.loanInfo = `欠${item.loan.toFixed(1)}万`;
                    } else {
                        item.loanInfo = `无欠款`;
                    }

                    if (item.isUnique == '暂无数据') {
                        item.isUnique = '';
                    }
                })

                that.setData({
                    houses: res.result
                })
            })
            .catch(console.error)
            .finally(() => {
                Toast.clear()
                that.setData({ tabActive: 999 })
            });
    },

    onClearLocation() {
        this.setData({
            locationMainActiveIndex: 0,
            locationActiveIds: []
        });
    },

    onClearRooms() {
        this.setData({
            selectedRooms: []
        });
    },

    noop() { },

    onUpdateQ({ detail }) {
        this.setData({ q:detail })
    },

    onUpdateSelectedRooms({detail}) {
        this.setData({
            selectedRooms: detail
        });
    }
});