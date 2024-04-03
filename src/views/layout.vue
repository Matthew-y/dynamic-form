<template>
    <div class="page">
        <Menu
            mode="inline"
            theme="dark"
            :items="items"
        />
        <div class="content">
            <div v-for="row in layout" class="row">
                <section v-for="sector in row" :style="getSectorStyle(sector)">
                    <Tree v-if="sector.name.includes('树')" :fm-id="sector.fmId" :base-url="requestUrl"/>
                    <Table v-else-if="sector.name.includes('表')" :fm-id="sector.fmId" :base-url="requestUrl"/>
                </section>
            </div>
        </div>
    </div>

</template>

<script setup lang="jsx">
import {ref, reactive, h} from "vue";
import { uniq } from 'lodash'
import { Menu } from "ant-design-vue";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
    MailOutlined,
    DesktopOutlined,
    InboxOutlined,
    AppstoreOutlined,
} from '@ant-design/icons-vue';
import Tree from '../../packages/Tree/index.vue'
import Table from '../../packages/mhITable/index.vue'
import { getLayoutInfo, getMenuTree } from "../../packages/utils/api.js";

const requestUrl = '/request'
let layout = ref([])

getLayout()
getMenu()

let items = ref([
    {
        key: '1',
        icon: () => h(PieChartOutlined),
        label: 'Option 1',
        title: 'Option 1',
    },
    {
        key: '2',
        icon: () => h(DesktopOutlined),
        label: 'Option 2',
        title: 'Option 2',
    },
    {
        key: '3',
        icon: () => h(InboxOutlined),
        label: 'Option 3',
        title: 'Option 3',
    },
    {
        key: 'sub1',
        icon: () => h(MailOutlined),
        label: 'Navigation One',
        title: 'Navigation One',
        children: [
            {
                key: '5',
                label: 'Option 5',
                title: 'Option 5',
            },
            {
                key: '6',
                label: 'Option 6',
                title: 'Option 6',
            },
            {
                key: '7',
                label: 'Option 7',
                title: 'Option 7',
            },
            {
                key: '8',
                label: 'Option 8',
                title: 'Option 8',
            },
        ],
    },
    {
        key: 'sub2',
        icon: () => h(AppstoreOutlined),
        label: 'Navigation Two',
        title: 'Navigation Two',
        children: [
            {
                key: '9',
                label: 'Option 9',
                title: 'Option 9',
            },
            {
                key: '10',
                label: 'Option 10',
                title: 'Option 10',
            },
            {
                key: 'sub3',
                label: 'Submenu',
                title: 'Submenu',
                children: [
                    {
                        key: '11',
                        label: 'Option 11',
                        title: 'Option 11',
                    },
                    {
                        key: '12',
                        label: 'Option 12',
                        title: 'Option 12',
                    },
                ],
            },
        ],
    },
]);

async function getLayout() {
    let { data } = await getLayoutInfo(requestUrl, { fnId: '19797923423423' })
    let rowArr = processLayout(data)
    layout.value = rowArr
    console.log('layout\n', rowArr)
}

async function getMenu() {
    let { data } = await getMenuTree(requestUrl, { fnId: '19797923423423' })
    console.log('menu\n', data)
    processMenu(data)
    items = data
}

function processMenu(data) {
    data.forEach(item => {
        item.key = item.id
        if(item.children && item.children.length > 0) processMenu(item.children)
    })
}

function processLayout(layout) {
    let rows = layout.map(item => item.rowNum)
    let arr = uniq(rows).map(() => [])
    uniq(rows).forEach(num => {
        layout.forEach(item => {
            if(item.rowNum === num) arr[num-1].push(item)
        })
    })
    return arr
}

function getSectorStyle({ widthPercentage, heightPercentage }) {
    return {
        width: widthPercentage + '%',
        height: heightPercentage + '%',
    }
}

/*function getCustomComponent({ name, fmId }) {
    if(name.includes('树')) return [<Tree baseUrl={requestUrl} fmId={fmId} />]
    if(name.includes('表')) return [<Table baseUrl={requestUrl} fmId={fmId} />]
}*/
</script>


<style scoped lang="scss">
.page {
    display: flex;
    height: 100vh;
    ul.ant-menu, .content {
        height: 100%;
        max-height: 100%;
    }
    ul.ant-menu {
        width: 300px;
    }
    .content {
        background-color: beige;
        flex-grow: 1;
    }
}
.row {
    height: 100%;
    display: flex;
}
</style>