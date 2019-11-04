import { VantComponent } from '../common/component';
VantComponent({
    relation: {
        name: 'tabs-pro',
        type: 'ancestor'
    },
    props: {
        dot: Boolean,
        info: null,
        title: String,
        disabled: Boolean,
        titleStyle: String,
        name: {
            type: [Number, String],
            value: '',
            observer: 'setComputedName'
        }
    },
    data: {
        width: null,
        inited: false,
        active: false,
        animated: false
    },
    watch: {
        title: 'update',
        disabled: 'update',
        dot: 'update',
        info: 'update',
        titleStyle: 'update'
    },
    methods: {
        setComputedName() {
            this.computedName = this.data.name || this.index;
        },
        update() {
            const parent = this.getRelationNodes('../tabs-pro/index')[0];
            if (parent) {
                parent.updateTabs();
            }
        }
    }
});
