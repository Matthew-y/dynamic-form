<template>
    <div class="edit-down-table">
        <vxe-pulldown class="edit-down-pulldown" ref="xDown" transfer>
            <template #default>
                <vxe-input
                    type="search"
                    clearable
                    class="edit-down-input"
                    v-model="currentVal"
                    @searchClick='onSearchClick'
                    @keyup="keyupEvent"
                    @click="clickEvent"
                    @suffix-click="suffixClick"
                />
            </template>
            <template #dropdown>
                <div class="edit-down-wrapper">
                    <vxe-grid ref='grid' v-bind="gridOptions" keep-source @cell-click="selectEvent">
                        <template #pager>
                            <vxe-pager
                                :layouts="[
                                    'Sizes',
                                    'PrevJump',
                                    'PrevPage',
                                    'Number',
                                    'NextPage',
                                    'NextJump',
                                    'FullJump',
                                    'Total',
                                ]"
                                :current-page='page.currentPage'
                                :page-size='page.pageSize'
                                :total='page.total'
                                @page-change='handlePageChange'
                            />
                        </template>
                        <template #EditDownTable></template>
                    </vxe-grid>
                </div>
            </template>
        </vxe-pulldown>
    </div>
</template>
<script lang="ts">
export default { name: 'EditDownTable' }
</script>
<script lang='ts' setup>
import {
    PropType,
    reactive,
    ref,
    Ref,
    watch,
    defineEmits,
    onMounted,
    inject, computed
} from 'vue'
import {VxePulldownInstance, VxeGridProps, VxeGlobalRendererHandles} from 'vxe-table'
import {getPageList, getTableConfig, getTree} from '../utils/api.js'

const emit = defineEmits(['searchClick', 'changeEvent', 'update'])
const props = defineProps({
    params: Object as PropType<VxeGlobalRendererHandles.RenderEditParams>,
    url: String,
    column: Object,
    currVal: String
})
const currentVal = ref<string>('')
const grid = ref<Ref | null>(null)

const xDown = ref({} as VxePulldownInstance)
const page = reactive({
    currentPage: 1,
    pageSize: 15,
    total: 0,
    totalPage: 1
})
let tempData = reactive<[]>([])

let gridOptions = reactive({
    autoResize: true,
    height: 'auto',
    loading: false,
    rowConfig: {
        isHover: true
    },
    columns: [],
    data: []
} as VxeGridProps)
const demo1 = reactive({
    row: null as any,
    column: null as any
})
const url = inject('baseUrl')
const fmId = inject('fmId')
let currVal = computed(() => props.currVal)

load()
onMounted(() => {
})
watch(
    currentVal,
    val => {
        emit('update', val)
        getDataList()
    }
)
// 查询弹窗选中数据后手动触发组件的输入框值更新
watch(
    currVal,
    val => currentVal.value = val as string
)
watch(
    page,
    () => getDataList(),
    { deep:true }
)

// 获取表格配置
async function getConfig() {
    let id = props.column.externalModule
    if (!id) return
    let { data } = await getTableConfig(url, {fmId: id})
    formatGridOptions(data)
    // data.treeConfig = treeConfig
    gridOptions = data
    await getDataList()
}

// 获取表格数据
async function getDataList() {
    let id = props.column.externalModule
    if (!id) return
    let params = {fmId: id, limit: page.pageSize, page: page.currentPage}
    params[props.column.externalQueryName] = currentVal.value
    let { data } = await getPageList(url, params)
    tempData = data.list
    setPageConf(data)
    if (grid.value) grid.value.reloadData(data.list)
}
// 修改分页
function setPageConf({ currentPage, pageSize, total, totalPage }) {
    page.currentPage = currentPage
    page.pageSize = pageSize
    page.total = total
    page.totalPage = totalPage
}

// 初始化
function load() {
    const {params} = props
    if (params) {
        const {row, column} = params
        currentVal.value = row[column.field]
        getConfig()
    }
}
// 分页方法
function handlePageChange({ type, currentPage, pageSize }) {
    if (type === 'current') {
        page.currentPage = currentPage
    } else if (type === 'size') {
        page.pageSize = pageSize
    }
}
// 搜索按钮点击函数
function onSearchClick() {
    xDown.value.hidePanel()
    emit('searchClick')
}

// 点击输入框函数
async function clickEvent() {
    await xDown.value.showPanel()
    grid.value.reloadData(tempData)
}

// 输入框输入
function keyupEvent() {
    const {row, column} = props.params as { row: any, column: any }
    if (column) {
        gridOptions.loading = true
        gridOptions.loading = false
        let data = []
        if (currentVal.value) {
            gridOptions.data = data.filter((item: any) => item.name.indexOf(currentVal.value) > -1)
        } else {
            gridOptions.data = data
        }
    }
}

function suffixClick() {
    xDown.value.togglePanel()
}

// 分页变化函数
function pageChangeEvent({currentPage, pageSize}) {
    const {pagerConfig} = gridOptions
    if (pagerConfig) {
        pagerConfig.currentPage = currentPage
        pagerConfig.pageSize = pageSize
    }
    getConfig()
}

// grid选择函数
function selectEvent({row, column}) {
    let {externalRe, field} = props.column
    currentVal.value = row[externalRe[field]]
    let data = new Object({})
    Object.keys(externalRe).forEach(key => {
        data[key] = row[externalRe[key]]
    })
    emit('changeEvent', data)
    if (column) {
        xDown.value.hidePanel()
    }
}

function formatGridOptions(data: any) {
    data.editConfig = JSON.parse(data.editConfig)
    data.rowConfig = JSON.parse(data.rowConfig)
    data.toolbarConfig = JSON.parse(data.toolbarConfig)
    formatColumns(data.columns)
}

function formatColumns(columnList: []) {
    columnList.forEach((item: any) => {
        // item.field = props.column.externalRe[item.field]
        item.fixed === 'left' ? (item.isFixed = true) : ''
        item.visible = item.showState === 1
        item.slots = convertSlots(item.slots)
        item.editRender = formatEditRender(item.editRender)
    })
}

function convertSlots(slots: object) {
    if (typeof slots === 'string') {
        if (!slots) return {};
        let newSlots = JSON.parse(slots);
        Object.keys(newSlots).forEach((key) => {
            if (typeof newSlots[key] !== 'string' || !newSlots[key].includes('=>')) return
            newSlots[key] = eval(newSlots[key]);
        });
        return newSlots;
    } else {
        if (!slots) return JSON.stringify({})
        Object.keys(slots).forEach((key) => {
            // if(typeof slots[key] !== 'function') return
            let fnStr = slots[key].toString()
            if (fnStr.includes('React.createElement')) {
                fnStr = fnStr.replaceAll('React.createElement', '_createVNode')
            }
            slots[key] = fnStr
        })
        return JSON.stringify(slots);
    }
}

function formatEditRender(render: any) {
    if (typeof render === 'string') {
        render = JSON.parse(render)
        render.events.change = eval(render.events.change)
    } else {
        try {
            render.events.change = render.events.change.toString()
        } catch (e) {
            console.log(render)
        }
        render = JSON.stringify(render)
    }
    return render
}
</script>
<style lang="scss" scoped>
.edit-down-pulldown {
    width: 100%;
}

.edit-down-wrapper {
    width: 600px;
    max-height: 300px;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.1);
}
</style>
