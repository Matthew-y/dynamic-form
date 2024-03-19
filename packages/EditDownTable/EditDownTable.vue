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
          <vxe-grid ref='grid' v-bind="gridOptions" @cell-click="selectEvent" @page-change="pageChangeEvent">
              <template #EditDownTable='data'></template>
              <template #DatePicker='data'></template>
          </vxe-grid>
        </div>
      </template>
    </vxe-pulldown>
  </div>
</template>
<script lang='ts' setup>
import { defineComponent, PropType, reactive, ref, Ref, watch, defineEmits, onMounted } from 'vue'
import { VxePulldownInstance, VxeTableEvents, VxeGridProps, VxePagerEvents, VxeGlobalRendererHandles } from 'vxe-table'
import { getQueryData } from '../mhITable/api.js'

const emit = defineEmits(['searchClick', 'changeEvent', 'update'])
const props = defineProps({
    params: Object as PropType<VxeGlobalRendererHandles.RenderEditParams>,
    url: String,
    tcId: String
})

const currentVal = ref<string>('')
const grid = ref<Ref|null>(null)

const xDown = ref({} as VxePulldownInstance)
let tempData = reactive<[]>([])

let gridOptions = reactive({
    autoResize: true,
    height: 'auto',
    loading: false,
    rowConfig: {
        isHover: true
    },
    pagerConfig: {
        enabled: true,
        total: 0,
        currentPage: 1,
        pageSize: 10
    },
    columns: [
        { type: 'seq' },
        { field: 'name', title: 'Name' },
        { field: 'role', title: 'Role' },
        { field: 'sex', title: 'Sex' }
    ],
    data: []
} as VxeGridProps)
const demo1 = reactive({
    row: null as any,
    column: null as any
})

load()
onMounted(() => {
    console.log('mount')
})
watch(
    currentVal,
    (val) => {
        console.log(val)
        emit('update', val)
    }
)

function getData(){
    getQueryData(props.url, { tcId: props.tcId, limit: 10, page: 1 }).then(({ data }) => {
        console.log(data)
        formatGridOptions(data)
        gridOptions = data
        gridOptions.data = data.page.list
        tempData = data.page.list
    })
    /*return new Promise(resolve => {
        setTimeout(() => {
            const list = [
                { name: 'Test1', role: '前端', sex: '男' },
                { name: 'Test2', role: '后端', sex: '男' },
                { name: 'Test3', role: '测试', sex: '男' },
                { name: 'Test4', role: '设计师', sex: '女' },
                { name: 'Test5', role: '前端', sex: '男' },
                { name: 'Test6', role: '前端', sex: '男' },
                { name: 'Test7', role: '前端', sex: '男' }
            ]
            resolve(list)
        }, 100)
    })*/
}
function load() {
    const { params } = props
    if (params) {
        const { row, column } = params
        currentVal.value = row[column.field]
        demo1.row = row
        demo1.column = column
        getData()
    }
}
function onSearchClick() {
    emit('searchClick')
}
function clickEvent() {
    const $pulldown = xDown.value
    $pulldown.showPanel()
}
function keyupEvent() {
    const { row, column } = props.params as { row: any, column: any }
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
function pageChangeEvent({ currentPage, pageSize }) {
    const { pagerConfig } = gridOptions
    if (pagerConfig) {
        pagerConfig.currentPage = currentPage
        pagerConfig.pageSize = pageSize
    }
    getData()
}
function selectEvent(params: any) {
    const { row, column } = props.params as { row: any, column: any }
    currentVal.value = row[column.field]
    emit('changeEvent', currentVal.value)
    if (column) {
        xDown.value.hidePanel()
    }
}
function formatGridOptions(data: any) {
    data.editConfig = JSON.parse(data.editConfig)
    data.toolbarConfig = JSON.parse(data.toolbarConfig)
    formatColumns(data.columns)
}
function formatColumns(columnList: []) {
    columnList.forEach((item: any) => {
        item.fixed === 'left' ? (item.isFixed = true) : ''
        item.visible = item.showState === 1
        item.slots = convertSlots(item.slots)
        item.editRender = formatEditRender(item.editRender)
    })
}
function convertSlots(slots: object) {
    if(typeof slots === 'string') {
        if (!slots) return {};
        let newSlots = JSON.parse(slots);
        Object.keys(newSlots).forEach((key) => {
            if(typeof newSlots[key] !== 'string'|| !newSlots[key].includes('=>')) return
            newSlots[key] = eval(newSlots[key]);
        });
        return newSlots;
    }else{
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
    if(typeof render === 'string') {
        render = JSON.parse(render)
        render.events.change = eval(render.events.change)
    }else{
        try{
            render.events.change = render.events.change.toString()
        }catch (e) {
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
  //height: 300px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.1);
}
</style>
