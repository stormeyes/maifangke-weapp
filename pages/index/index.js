const locations = require("../../contants/location.js");

Page({
    data: {
        locations,
        result: ['a', 'b'],
        mainActiveIndex: 0,
        activeId: [],
        items: [
            {
                text: '南山',
                children: [
                    {
                        text: '南头',
                        id: 1
                    },
                    {
                        text: '科技园',
                        id: 2
                    }
                ]
            },
            {
                text: '福田',
                children: [
                    {
                        text: '新洲',
                        id: 3
                    },
                    {
                        text: '上下洲',
                        id: 4
                    }
                ]
            },
            {
                text: '罗湖',
                children: [
                    {
                        text: '百仕达',
                        id: 5
                    },
                    {
                        text: '国贸',
                        id: 6
                    }
                ]
            },
        ],
        max: 2,
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

    onChange(event) {
        this.setData({
            result: event.detail
        });
    },

    onClose() {
        this.setData({ show: false });
    },

    onSelect(event) {
        console.log(event.detail);
    },
    showPopup(event) {
        this.setData({ show: true });
    },
    onClickNav({ detail = {} }) {
        this.setData({
            mainActiveIndex: detail.index || 0
        });
    },

    onClickItem({ detail = {} }) {
        const { activeId } = this.data;

        const index = activeId.indexOf(detail.id);
        if (index > -1) {
            activeId.splice(index, 1);
        } else {
            activeId.push(detail.id);
        }

        this.setData({ activeId });
    }
});