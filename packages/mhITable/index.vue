<template>
    <div class='d-table'>
        <div class='d-table-toolbar'>
              <span>
                <Button @click='open' type='primary'>新增数据</Button>
              </span>
            <span>
                <vxe-button size='mini' @click='getDataList' icon='vxe-icon-refresh'></vxe-button>
                <vxe-button size='mini' @click='tableConfVisible = true'
                            icon='vxe-icon-custom-column'></vxe-button>
            </span>
        </div>
        <div style='flex-grow: 1'>
            <vxe-grid
                v-bind='gridOptions'
                ref='grid'
                @resizable-change='handleColumnResize'
                :style="{ height: props.height + 'px' }"
            >
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
                <template #EditDownTable='data'>
                    <EditDownTable
                        :tcId='getColumnId(data.$columnIndex)'
                        :params='data'
                        :url='props.baseUrl'
                        v-model='data.row[data.column.field]'
                        @update='(value) => data.row[data.column.field] = value'
                        @searchClick='dataTableVisible = true'
                        @changeEvent='(value) => changeEvent(data, value)'
                    />
                </template>
                <template #DatePicker='{ row, column }'>
                    <DatePicker v-model='row[column.field]' />
                </template>
            </vxe-grid>
        </div>
        <!--  表格编辑弹窗  -->
        <Modal title='编辑表格' centered v-model:open='tableConfVisible' :width='800' :footer='null'>
            <div class='t-table-edit'>
                <vxe-table
                    ref='configTable'
                    border
                    show-overflow
                    keep-source
                    :row-config='{ isCurrent: true }'
                    :edit-config="{ trigger: 'click', mode: 'cell' }"
                    :mouse-config='{ selected: true }'
                    :data='gridOptions.columns'
                    height='400px'
                    align='center'
                    size='mini'
                    style='width: 710px; flex-grow: 1; overflow: auto'
                    @cell-selected='onCellSelected'
                >
                    <vxe-column type='seq' width='30' />
                    <vxe-column
                        field='title'
                        title='列名'
                        width='160'
                        :edit-render="{ autofocus: '.vxe-input--inner' }"
                    >
                        <template #edit='{ row }'>
                            <vxe-input align='center' v-model='row.title' type='text' />
                        </template>
                    </vxe-column>
                    <vxe-column field='originalTitle' title='原始列名' width='160'>
                        <template #default='{ row }'>
                            <span>{{ row.originalTitle }}</span>
                        </template>
                    </vxe-column>
                    <vxe-column
                        field='width'
                        title='宽度'
                        width='100'
                        :edit-render="{ autofocus: '.vxe-input--inner' }"
                    >
                        <template #edit='{ row }'>
                            <vxe-input align='center' type='number' v-model='row.width' :min='70' />
                        </template>
                    </vxe-column>
                    <vxe-column field='align' title='内容对其' width='100' :edit-render="{ autofocus: '' }">
                        <template #default='{ row }'>{{ findLabel(row.align) }}</template>
                        <template #edit='{ row }'>
                            <vxe-select v-model='row.align'>
                                <vxe-option
                                    v-for='item in alignOptions'
                                    :key='item.value'
                                    :value='item.value'
                                    :label='item.label'
                                />
                            </vxe-select>
                        </template>
                    </vxe-column>
                    <vxe-column width='100' field='show' title='是否显示' :edit-render="{ autofocus: '' }">
                        <template #default='{ row }'>
                            <vxe-checkbox v-model='row.visible' />
                        </template>
                        <template #edit='{ row }'>
                            <vxe-checkbox v-model='row.visible' />
                        </template>
                    </vxe-column>
                    <vxe-column width='70' field='isFixed' title='锁定' :edit-render="{ autofocus: '' }">
                        <template #default='{ row }'>
                            <vxe-checkbox v-model='row.isFixed' />
                        </template>
                        <template #edit='{ row }'>
                            <vxe-checkbox v-model='row.isFixed' />
                        </template>
                    </vxe-column>
                    <vxe-column
                        field='remarks'
                        title='备注'
                        width='240'
                        :edit-render="{ autofocus: '.vxe-input--inner' }"
                    >
                        <template #edit='{ row }'>
                            <vxe-input align='center' v-model='row.remarks' type='text' />
                        </template>
                    </vxe-column>
                </vxe-table>
                <div class='d-table-action-column'>
                    <Button size='small' @click='updateColumnsConf'>保存</Button>
                    <Button size='small' @click='resetColumnConf'>恢复默认</Button>
                    <Button size='small' @click="moveRow('up')">上移</Button>
                    <Button size='small' @click="moveRow('down')">下移</Button>
                </div>
            </div>
        </Modal>
        <Modal title='查找' centered v-model:open='dataTableVisible' :width='1000'>
            <vxe-grid ref='searchGrid' v-bind='gridOptionsPop' @cell-click='selectCell'/>
        </Modal>
        <Modal title='确认删除？' centered v-model:open='delVisible' @ok='removeDataRow'>
            确认删除此条数据吗？
        </Modal>
    </div>
</template>

<script lang='jsx'>
export default { name: 'MhITable' }
</script>
<script setup lang='jsx'>
import { cloneDeep } from 'lodash'
import {
    getTableConfig,
    deleteData,
    getPageList,
    updateColumn,
    updateColumns,
    getQueryData,
    updateRow
} from './api.js'
import { handleMsg } from './tool.js'
import { createTextVNode, createVNode, reactive, ref, watch } from 'vue'
import { alignOptions } from './data'
import { VxeInput, VxeButton } from 'vxe-table'
import EditDownTable from '../EditDownTable/EditDownTable.vue'
import { Modal, Button, DatePicker } from 'ant-design-vue'

const _createVNode = createVNode // 提前注册表格配置插槽渲染虚拟dom所需方法
const _createTextVNode = createTextVNode // 如上
const selectedRowId = ref('')
const delDataId = ref('')
const action = ref('create')
const grid = ref(null)
const configTable = ref(null)
const tableConfVisible = ref(false)
const isSorted = ref(false)
const delVisible = ref(false)
const dataTableVisible = ref(false)

const emit = defineEmits(['editRow', 'createRow', 'openModal'])
const props = defineProps({
    fmId: {
        type: String,
        default: () => ''
    },
    height: {
        type: Number,
        default: () => 0
    },
    baseUrl: {
        type: String,
        default: () => '/api'
    }
})
// 表格配置项
let gridOptions = reactive({})
let gridOptionsPop = reactive({})
let resetColumnData = reactive([])

let page = reactive({
    currentPage: 1,
    pageSize: 15,
    total: 295,
    totalPage: 30
})
const optionColumn = {
    field: 'operation',
    title: '操作',
    width: '100',
    slots: {
        default: ({ row }) => {
            return [
                <span
                    style='user-select: none;color: #0960bd;cursor: pointer;'
                    onClick={() => editRow(row)}
                >
      编辑
      </span>,
                <span
                    style='user-select: none;color: #0960bd;cursor: pointer;margin-left: 10px;'
                    onClick={() => {
                        delVisible.value = true
                        delDataId.value = row.id
                    }}
                >
      删除
      </span>
            ]
        }
    }
}
// -----------------------------------------------------------------
getTableConf()

// 监听分页请求数据
watch(
    () => page,
    () => getDataList(),
    { deep: true }
)
// 监听编辑表格窗口的打开保存初始配置
watch(
    () => tableConfVisible.value,
    (value) => {
        if (resetColumnData.length > 0 || !value) return
        resetColumnData = cloneDeep(gridOptions.columns)
    }
)

function selectCell({ row, column }) {
    console.log(row[column.field])
    dataTableVisible.value = false
}

function getColumnId(index) {
    return gridOptions.columns[index].id
}

function editRow(row) {
    grid.value.setEditRow(row)
    emit('editRow', row.id)
}

function searchClick({ field }) {
    let tcId = gridOptions.columns.find(item => item.field === field).id
    getQueryData(props.baseUrl, { tcId, limit: 10, page: 1 }).then(({ data }) => {
        formatGridOptions(data)
        data.data = data.page.list
        gridOptionsPop = data
        dataTableVisible.value = true
    })
}

// 获取对其选项值对应的标签
function findLabel(option) {
    return alignOptions.find((item) => item.value === option)?.label
}

// 获取表格列配置并更新
function getColumnList() {
    getTableConfig(props.baseUrl, { fmId: props.fmId }).then(({ data }) => {
        let columns = data.columns
        formatColumns(columns)
        gridOptions.columns = columns
        grid.value.reloadColumn(columns)
    })
}

// 初始获取表格配置
function getTableConf() {
    gridOptions.loading = true
    getTableConfig(props.baseUrl, { fmId: props.fmId }).then(({ data }) => {
        console.log(data)
        formatGridOptions(data)
        gridOptions.loading = false
        gridOptions = data
        getDataList()
    })
}
// 下拉表格change事件
function changeEvent(data, value) {
    console.log(value)
    let { column } = data
    column.editRender.events.change(data)
    // updateDataRow(data)
}
// 更新单行数据
function updateDataRow(data){
    updateRow(props.baseUrl, { fmId: props.fmId, data }).then(({ code, message }) => {
        if(code !== 200) handleMsg({ code, message })
    })
}
// 删除单行数据
function removeDataRow() {
    deleteData(props.baseUrl, { fmId: props.fmId, id: delDataId.value }).then(res => {
        handleMsg(res)
        if (res.code !== 200) return
        delDataId.value = ''
        delVisible.value = false
        getDataList()
    })
}

// 更新表格列配置
function updateColumnsConf() {
    if (isSorted.value) setColumnSort()
    gridOptions.columns.forEach((column) => {
        column.fixed = column.isFixed ? 'left' : ''
        column.showState = column.visible ? 1 : 2
        column.slots = convertSlots(column.slots)
        column.editRender = formatEditRender(column.editRender)
    })
    updateColumns(props.baseUrl, gridOptions.columns).then((res) => {
        handleMsg(res)
        if (res.code === 200) {
            getColumnList()
            tableConfVisible.value = false
        }
    })
}
// 重置表格初始加载时的列配置
function resetColumnConf() {
    grid.value.reloadColumn(resetColumnData)
    configTable.value.reloadData(resetColumnData)
}
// 表格列被重新排序后更新列的排序字段
function setColumnSort() {
    let len = gridOptions.columns.length
    gridOptions.columns.forEach((column) => {
        column.sort = len
        len--
    })
}
// 获取表格数据
function getDataList() {
    getPageList(props.baseUrl, {
        fmId: props.fmId,
        limit: page.pageSize,
        page: page.currentPage
    }).then(({ data }) => {
        setPageConf(data)
        if (grid.value) grid.value.reloadData(data.list)
    })
}
// 更新分页数据
function setPageConf({ currentPage, pageSize, total, totalPage }) {
    page.currentPage = currentPage
    page.pageSize = pageSize
    page.total = total
    page.totalPage = totalPage
}

async function open() {
    emit('createRow')
    action.value = 'create'
}
// 分页更新
function handlePageChange({ type, currentPage, pageSize }) {
    if (type === 'current') {
        page.currentPage = currentPage
    } else if (type === 'size') {
        page.pageSize = pageSize
    }
}
// 拖拽调整列宽
function handleColumnResize(data) {
    let { field, resizeWidth } = data.column
    let column = gridOptions.columns.find((item) => item.field === field)
    if (!column) return
    let config = {
        ...column,
        width: resizeWidth,
        slots: convertSlots(column.slots)
    }
    updateColumn(props.baseUrl, config)
}

function onCellSelected({ row }) {
    selectedRowId.value = row.id
}
// 移动列排序
function moveRow(direction) {
    if (!selectedRowId.value) return

    let currIndex = gridOptions.columns.findIndex(
        ({ id }) => (id) === (selectedRowId.value)
    )
    if (gridOptions.columns[currIndex].title === '操作') return
    isSorted.value = true
    if (direction === 'up') {
        if (currIndex < 1) return
        let currItem = gridOptions.columns[currIndex]
        gridOptions.columns[currIndex] = gridOptions.columns[currIndex - 1]
        gridOptions.columns[currIndex - 1] = currItem
    } else if (direction === 'down') {
        if (currIndex + 1 >= gridOptions.columns.length) return
        let currItem = gridOptions.columns[currIndex]
        gridOptions.columns[currIndex] = gridOptions.columns[currIndex + 1]
        gridOptions.columns[currIndex + 1] = currItem
    }
    if (configTable.value) configTable.value.reloadData(gridOptions.columns)
}

function formatEditRender(render) {
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

// 格式化gridOptions
function formatGridOptions(data) {
    data.editConfig = JSON.parse(data.editConfig)
    data.toolbarConfig = JSON.parse(data.toolbarConfig)
    formatColumns(data.columns)
}

// 保存列配置前格式化转换字段
function formatColumns(columnList) {
    columnList.forEach((item) => {
        item.fixed === 'left' ? (item.isFixed = true) : ''
        item.visible = item.showState === 1
        item.slots = convertSlots(item.slots)
        item.editRender = formatEditRender(item.editRender)
    })
}

// 转换插槽配置
function convertSlots(slots) {
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
</script>

<style scoped lang='less'>

.d-table {
    height: 100%;
    margin: 10px;
    display: flex;
    flex-direction: column;

    .d-table-toolbar {
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #fff;
        &>span {
            display: flex;
        }
    }

}
.d-table-action-column {
    width: 100px;
    padding-top: 10px;
    border-top: 1px solid #e8eaec;
    border-bottom: 1px solid #e8eaec;
    border-right: 1px solid #e8eaec;
    align-items: center;
    display: flex;
    flex-direction: column;

    button {
        width: 72px;
        margin-bottom: 10px;
    }
}
.t-table-edit {
    display: flex;
}
</style>
