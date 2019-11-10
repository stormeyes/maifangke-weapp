const locations = require("../../contants/location.js");
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';

Page({
    data: {
        page: 1,
        pageSize: 20,
        fetching: false,
        isEnd: false,
        q: undefined,
        locations,
        tabActive: 999,
        plain: true,
        rooms: [{ name: "单间", value: 0 }, { name: "一房", value: 1 }, { name: "两房", value: 2 }, { name: "三房", value: 3 }, { name: "四房", value: 4 }],
        priceRange: [
            {min:0, max:200}, {min:200, max:300}, {min:300, max:400}, {min:400, max:500}, {min:500, max:600}, {min:600, max:0}
        ],
        areaRange: [
            { min: 0, max: 50 }, { min: 50, max: 70 }, { min: 70, max: 90 }, { min: 90, max: 110 }, { min: 110, max: 140 }, { min: 140, max: 170 }, { min: 170, max: 200 }, { min: 200 }
        ],
        featureRange: [
            {text: "满五唯一", value: "fiveAndUniq"},
            {text: "红本在手", value: "noLoan"},
            {text: "只看住宅", value: "houseOnly"},
            {text: "包含下线房源", value: "offlineInclude"}
        ],
        towardsRange: ["东", "西", "南", "北"],
        selectedTowards: [],
        selectedAreas: [],
        selectedPrices: [],
        selectedRooms: [],
        selectedFeatures: [],
        locationMainActiveIndex: 0,
        locationActiveIds: [],
        houses: [],
    },

    onLoad() {
        this.onFetchHouse({});
    },

    updateSelectedPrice({currentTarget}) {
        const { dataset } = currentTarget;
        const {
            selectedPrices
        } = this.data;

        const index = selectedPrices.indexOf(dataset.index);

        if (index > -1) {
            selectedPrices.splice(index, 1);
        } else {
            selectedPrices.push(dataset.index);
        }

        this.setData({
            selectedPrices
        });
    },

    toggle(event) {
        const { index } = event.currentTarget.dataset;
        const checkbox = this.selectComponent(`.checkboxes-${index}`);
        checkbox.toggle();
    },

    onClickNav({detail = {}}) {
        this.setData({
            locationMainActiveIndex: detail.index || 0
        });
    },

    onClickItem({detail = {}}) {
        const { locationActiveIds } = this.data;

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

    onFetchHouse({ isAppend=false } = {}) {
        const { fetching } = this.data;
        const that = this;
        !isAppend && Toast.loading({
            mask: true,
            forbidClick: true,
            duration: 0,
            loadingType: "spinner",
            message: '加载中...',
            selector: '#custom-selector'
        });
        wx.cloud.init({
            env: "debug-enbxd"
        });
        wx.cloud.callFunction({
                name: 'query_house',
                data: {
                    page: that.data.page,
                    pageSize: that.data.pageSize,
                    locationIds: that.data.locationActiveIds,
                    q: that.data.q,
                    rooms: that.data.selectedRooms,
                    prices: function() {
                        const prices = [];
                        that.data.selectedPrices.map(index => {
                            prices.push(that.data.priceRange[index]);
                        });
                        return prices;
                    }(),
                    areas: function () {
                        const areas = [];
                        that.data.selectedAreas.map(index => {
                            areas.push(that.data.areaRange[index]);
                        });
                        return areas;
                    }(),
                    towards: function(){
                        const towards = [];
                        that.data.selectedTowards.map(index => {
                            towards.push(that.data.towardsRange[index]);
                        });
                        return towards;
                    }(),
                    features: function () {
                        const features = [];
                        that.data.selectedFeatures.map(index => {
                            features.push(that.data.featureRange[index].value);
                        });
                        return features;
                    }()
                },
            })
            .then(res => {
                res.result.map(item => {
                    item.area = Math.ceil(item.area);
                    item.monthlyMortgage = item.monthlyMortgage.toFixed(1);
                    item.floor = item.floor.substring(0,3);
                    item.rentPrice = item.rentPrice || '-';

                    if (item.room == 0 || (item.room == 1 && [0, ''].includes(item.ting))) {
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

                    if (item.ladderPerHouseholds == '-') {
                        item.ladderPerHouseholds = '无电梯';
                    }
                });

                isAppend ? that.setData({
                    houses: that.data.houses.concat(res.result)
                }) : that.setData({
                    houses: res.result
                });
            })
            .catch(console.error)
            .finally(() => {
                Toast.clear();
                that.setData({ tabActive: 999, fetching: false });
                const tabs = this.selectComponent(`.happy`);
                tabs.setActive(999);
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

    onClearPrices() {
        this.setData({
            selectedPrices: []
        });
    },

    onClearMore() {
        this.setData({
            selectedTowards: [],
            selectedAreas: []
        });
    },

    noop() { },

    onUpdateQ({ detail }) {
        this.setData({ q:detail })
    },

    onUpdateSelectedRooms({ detail }) {
        this.setData({
            selectedRooms: detail
        });
    },

    onUpdateSelectedFeatures({ currentTarget }) {
        const { dataset } = currentTarget;
        const {
            selectedFeatures
        } = this.data;

        const index = selectedFeatures.indexOf(dataset.index);
        if (index > -1) {
            selectedFeatures.splice(index, 1);
        } else {
            selectedFeatures.push(dataset.index);
        }

        this.setData({
            selectedFeatures
        });
    },

    onUpdateSelectedArea({ currentTarget }) {
        const { dataset } = currentTarget;
        const {
            selectedAreas
        } = this.data;

        const index = selectedAreas.indexOf(dataset.index);
        if (index > -1) {
            selectedAreas.splice(index, 1);
        } else {
            selectedAreas.push(dataset.index);
        }

        this.setData({
            selectedAreas
        });
    },

    onUpdateSelectedTowards({ currentTarget }) {
        const { dataset } = currentTarget;
        const {
            selectedTowards
        } = this.data;

        const index = selectedTowards.indexOf(dataset.index);
        if (index > -1) {
            selectedTowards.splice(index, 1);
        } else {
            selectedTowards.push(dataset.index);
        }

        this.setData({
            selectedTowards
        });
    },

    onReachBottom() {
        const {page, fetching} = this.data;
        if (fetching) {
            return;
        }

        this.setData({ page: page + 1, fetching: true});
        this.onFetchHouse({isAppend: true})
    }
});