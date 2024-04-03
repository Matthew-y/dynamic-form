<template>
    <div class='d-table'>
        <div class='d-table-toolbar'>
            <span>
                <vxe-button size="medium" @click='openForm("create")' status='primary'>新增数据</vxe-button>
<!--                <vxe-button size="medium" @click='openForm("edit")' status='primary'>编辑</vxe-button>-->
            </span>
            <span>
                <!--<vxe-input clearable placeholder="输入关键词查询" type="search" v-if="isBasicQuery" @click="getDataList()" />-->
                <vxe-button size="medium" status="primary" @click="basicQueryVisible = true" v-if="isBasicQuery">
                    普通查询
                </vxe-button>
                <vxe-button size="medium" status="primary" @click="advanceQueryVisible = true" v-if="isAdvanceQuery">
                    高级查询
                </vxe-button>
                <vxe-button size='mini' @click='getDataList' icon='vxe-icon-refresh'></vxe-button>
                <vxe-button size='mini' @click='tableConfVisible = true' icon='vxe-icon-custom-column'></vxe-button>
            </span>
        </div>
        <div style='flex-grow: 1'>
            <vxe-grid v-bind='gridOptions' ref='grid' @edit-closed="({row}) => updateDataRow(row)" @resizable-change='handleColumnResize'
                :style="{ height: props.height }">
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
                        :current-page='pageMain.currentPage'
                        :page-size='pageMain.pageSize'
                        :total='pageMain.total'
                        @page-change='(value) => handlePageChange("main", value)'
                    />
                </template>
                <template #EditDownTable='data'>
                    <EditDownTable
                        :column='getColumnInfo(data.$columnIndex)'
                        :params='data'
                        :currVal="editDownInputVal"
                        @update='(value) => data.row[data.column.field] = value'
                        @searchClick='openQueryForm(data.$columnIndex)'
                        @changeEvent='(value) => changeEvent(data, value)'
                    />
                </template>
                <template #DatePicker='{ row, column }'>
                    <DatePicker
                        :defaultValue='row[column.field]'
                        @change="(value) => row[column.field] = value"
                        valueFormat="YYYY-MM-DD"
                    />
                </template>
            </vxe-grid>
        </div>
        <!--  表格编辑弹窗  -->
        <Modal title='编辑表格' centered v-model:open='tableConfVisible' :width='800' :footer='null'>
            <div class='t-table-edit'>
                <vxe-table ref='configTable' border show-overflow :row-config='{ isCurrent: true, isHover: true }'
                    :edit-config="{ trigger: 'click', mode: 'cell' }" :mouse-config='{ selected: true }'
                    :data='gridOptions.columns' height='400px' align='center' size='mini'
                    style='width: 710px; flex-grow: 1; overflow: auto' @cell-selected='onCellSelected'>
                    <vxe-column type='seq' width='30' />
                    <vxe-column field='title' title='列名' width='160' :edit-render="{ autofocus: '.vxe-input--inner' }">
                        <template #edit='{ row }'>
                            <vxe-input align='center' v-model='row.title' type='text' />
                        </template>
                    </vxe-column>
                    <vxe-column field='originalTitle' title='原始列名' width='160'>
                        <template #default='{ row }'>
                            <span>{{ row.originalTitle }}</span>
                        </template>
                    </vxe-column>
                    <vxe-column field='width' title='宽度' width='100' :edit-render="{ autofocus: '.vxe-input--inner' }">
                        <template #edit='{ row }'>
                            <vxe-input align='center' type='number' v-model='row.width' :min='70' />
                        </template>
                    </vxe-column>
                    <vxe-column field='align' title='内容对其' width='100' :edit-render="{ autofocus: '' }">
                        <template #default='{ row }'>{{ findLabel(row.align) }}</template>
                        <template #edit='{ row }'>
                            <vxe-select v-model='row.align'>
                                <vxe-option v-for='item in alignOptions' :key='item.value' :value='item.value'
                                    :label='item.label' />
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
                    <vxe-column field='remarks' title='备注' width='240'
                        :edit-render="{ autofocus: '.vxe-input--inner' }">
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
        <!--  单元格数据查询  -->
        <Modal title='查找' centered v-model:open='dataTableVisible' :width='1000' :footer="null">
            <BasicForm @register="register" />
            <vxe-grid style="margin-top: 20px" ref='searchGrid' v-bind='gridOptionsPop' @cell-click='selectCell'>
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
                        :current-page='pagePop.currentPage'
                        :page-size='pagePop.pageSize'
                        :total='pagePop.total'
                        @page-change='(value) => handlePageChange("pop", value)'
                    />
                </template>
            </vxe-grid>
        </Modal>
        <Modal title='高级查询' centered v-model:open="advanceQueryVisible" :width="900" :footer="null">
            <BasicForm @register="queryRegister"/>
        </Modal>
        <!--  删除确认弹窗  -->
        <Modal title='确认删除？' centered v-model:open='delVisible' @ok='removeDataRow'>
            确认删除此条数据吗？
        </Modal>
        <Modal title="新增" v-model:open="creationFormVisible" :footer="null">
            <BasicForm @register="creationRegister" />
        </Modal>
        <Drawer placement="left" title="普通查询" :open="basicQueryVisible" @close="basicQueryVisible = false">
            <BasicForm @register="basicQueryRegister"/>
        </Drawer>
    </div>
</template>

<script lang='jsx'>
export default { name: 'Table' }
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
    updateRow,
    getDynamicQueryForm,
    getCreateForm,
    createTableData,
} from '../utils/api.js'
import { basicFormProps, alignOptions, schemas } from "./data";
import { handleMsg, showObjStr, isString, formatFormFields } from '../utils/tool.ts'
import {createTextVNode, createVNode, reactive, ref, watch, provide, computed, nextTick} from 'vue'
import VXETable, { VxeInput, VxeButton } from 'vxe-table'
import EditDownTable from '../EditDownTable/EditDownTable.vue'
import { Modal, Button, DatePicker, Drawer } from 'ant-design-vue'
import VXETablePluginAntd from 'vxe-table-plugin-antd'
import { BasicForm, useForm } from 'vben-components'

VXETable.use(VXETablePluginAntd)
// 查询弹窗打开时关闭行编辑失焦的自动关闭
VXETable.interceptor.add('event.clearActived', (/*params, event*/) => {
    return !dataTableVisible.value
})
const _createVNode = createVNode // 提前注册表格配置插槽渲染虚拟dom所需方法
const _createTextVNode = createTextVNode // 如上
const selectedRowId = ref('')
const delDataId = ref('')
const editDownInputVal = ref('')
const action = ref('create')
const grid = ref(null)
const configTable = ref(null)
const searchGrid = ref(null)
const tableConfVisible = ref(false)
const isSorted = ref(false)
const delVisible = ref(false)
const dataTableVisible = ref(false)
const creationFormVisible = ref(false)
const advanceQueryVisible = ref(false)
const basicQueryVisible = ref(false)

const emit = defineEmits(['editRow', 'createRow', 'openModal'])
const props = defineProps({
    fmId: { type: String, default: () => '' },
    height: { type: String, default: () => '100%' },
    baseUrl: { type: String, default: () => '/api' }
})
provide('fmId', props.fmId)
provide('baseUrl', props.baseUrl)
// 表格配置项
let gridOptions = reactive({})
// 查询弹窗表格配置
// let gridOptionsPop = reactive({})
let gridOptionsPop = reactive({})
// 保存的用于重置列配置的数据
let resetColumnData = reactive([])
// 查询表单数据
let queryForm = reactive({})
const dynamicForms = reactive({
    default: {},
    basic: {},
    advance: {},
    create: {},
    edit: {},
})
// 主表格分页
let pageMain = reactive({
    currentPage: 1,
    pageSize: 15,
    total: 1,
    totalPage: 1
})
// 弹窗查询表格分页
let pagePop = reactive({
    currentPage: 1,
    pageSize: 15,
    total: 1,
    totalPage: 1
})
let queryParams = reactive({})
// 单元格数据查询表单
const [register, cellDataFormMethod] = useForm({
    ...basicFormProps,
    submitFunc: handleSubmit,
})
const [creationRegister, creationFormMethod] = useForm({
    ...basicFormProps,
    resetFunc: () => {},
    submitFunc: async () => {
        let form = creationFormMethod.getFieldsValue()
        let res = await createTableData(props.baseUrl, { fmId: props.fmId, data: form })
        handleMsg(res)
        if(res.code !== 200) return
        getDataList()
        creationFormVisible.value = false
    }
})
// 高级查询表单配置
const [queryRegister, advanceFormMethod] = useForm({
    ...basicFormProps,
    resetFunc: handleFormReset,
    submitFunc: () => {
        handleQuery(advanceFormMethod.getFieldsValue())
        advanceQueryVisible.value = false
    }
})
// 普通查询表单配置
const [basicQueryRegister, basicFormMethod] = useForm({
    ...basicFormProps,
    labelWidth: 70,
    resetFunc: handleFormReset,
    submitFunc: () => {
        handleQuery(basicFormMethod.getFieldsValue())
        basicQueryVisible.value = false
    }
})
// 不能删除
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
initialize()
showObjStr({ disabled: false, precision: 2 })
// 监听主表分页变化请求数据
watch(
    pageMain,
    () => {
        if(grid.value.getTableData().tableData.length === 0) return
        getDataList()
    },
    { deep: true }
)
// 监听查询表分页变化请求数据
watch(
    pagePop,
    () => getQueryList(),
    { deep: true }
)
// 监听编辑表格窗口的打开保存初始配置
watch(
    () => tableConfVisible.value,
    value => {
        if (resetColumnData.length > 0 || !value) return
        resetColumnData = cloneDeep(gridOptions.columns)
    }
)
// 监听高级查询窗口打开加载动态表单 TODO 优化：避免在每次打开窗口时重新加载表单
watch(
    () => advanceQueryVisible.value,
    value => {
        if(!(value || isAdvanceQuery)) return
        let fn = () => advanceFormMethod.resetSchema(dynamicForms.advance.formFields)
        nextTick(fn)
    }
)
// 监听普通查询窗口打开加载动态表单 TODO 优化：避免在每次打开窗口时重新加载表单
watch(
    () => basicQueryVisible.value,
    value => {
        if(!(value || isBasicQuery)) return
        let fn = () => basicFormMethod.resetSchema(dynamicForms.basic.formFields)
        nextTick(fn)
    }
)
// 监听新增窗口打开加载动态表单 TODO 优化：避免在每次打开窗口时重新加载表单
watch(
    () => creationFormVisible.value,
    value => {
        if(!value) return
        let fn = () => creationFormMethod.resetSchema(dynamicForms[action.value].formList)
        nextTick(fn)
    }
)

const isDefaultQuery = computed(() => Object.keys(dynamicForms.default).length > 0)
const isBasicQuery = computed(() => Object.keys(dynamicForms.basic).length > 0)
const isAdvanceQuery = computed(() => Object.keys(dynamicForms.advance).length > 0)

// 获取动态表单列表，判断查询条件
function initialize() {
    // 获取查询动态表单
    getDynamicQueryForm(props.baseUrl, { fmId: props.fmId }).then(({data}) => {
        data.forEach(item => formatFormFields(item.formFields))
        // 1普通查询表单 2默认查询表单 3高级查询表单
        dynamicForms.basic = data.find(item => item.type === 1)
        dynamicForms.default = data.find(item => item.type === 2)
        dynamicForms.advance = data.find(item => item.type === 3)
        dynamicForms.basic.formFields.forEach(item => item.colProps.span = 24)
        getTableConf()
    })
    // 获取新增动态表单
    getCreateForm(props.baseUrl, { fmId: props.fmId, updateOrCreate: 1 }).then(({data}) => {
        formatFormFields(data.formList)
        dynamicForms.create = data
    })
    getCreateForm(props.baseUrl, { fmId: props.fmId, updateOrCreate: 2 }).then(({data}) => {
        formatFormFields(data.formList)
        dynamicForms.edit = data
    })
}


// 弹窗表格选择数据
function selectCell({ row, column }) {
    let record = grid.value.getEditRecord()
    let data = {}
    gridOptions.columns.forEach(item => {
        if(!(item.externalModule === gridOptionsPop.fmId && item.showState === 1)) return
        Object.keys(item.externalRe).forEach(key => data[key] = row[item.externalRe[key]])
    })
    editDownInputVal.value = data[record.column.field]
    changeEvent(record, data)
    dataTableVisible.value = false
}
// 根据下标获取列配置
function getColumnInfo(index) {
    return gridOptions.columns.filter(item => item.showState === 1)[index]
}

// 开启行编辑状态
function editRow(row) {
    grid.value.setEditRow(row)
    emit('editRow', row.id)
}

// 获取对其选项值对应的标签
function findLabel(option) {
    return alignOptions.find((item) => item.value === option)?.label
}

function openQueryForm(index) {
    let { externalModule } = getColumnInfo(index)
    dataTableVisible.value = true
    gridOptionsPop.loading = true
    // 获取弹窗查询表格配置
    getTableConfig(props.baseUrl, { fmId: externalModule }).then(({data}) => {
        formatGridOptions(data) // 格式化grid参数
        gridOptionsPop = Object.assign(gridOptionsPop, data)
        searchGrid.value.reloadColumn(data.columns)
        getQueryList()
    })
    // 获取弹窗查询动态表单配置
    getDynamicQueryForm(props.baseUrl, { fmId: externalModule }).then(({data}) => {
        let { formFields } = data.find(form => form.type === 1)
        formatFormFields(formFields)
        cellDataFormMethod.resetSchema(formFields)
    })
}

// 获取查询弹窗表格数据
async function getQueryList() {
    if(!gridOptionsPop.loading) gridOptionsPop.loading = true
    let params = { fmId: gridOptionsPop.fmId, limit: pagePop.pageSize, page: pagePop.currentPage }
    Object.keys(queryForm).forEach(key => params[key] = queryForm[key])

    let { data } = await getPageList(props.baseUrl, params)
    gridOptionsPop.loading = false
    setPageConf('pop', data)
    searchGrid.value.reloadData(data.list)
}
// 查询弹窗确认查询
function handleSubmit() {
    queryForm = cellDataFormMethod.getFieldsValue() // 获取动态表单数据
    getQueryList()
}
// 清空查询条件
function handleFormReset() {
    let { basic, advance } = dynamicForms
    let fields = basic.formFields.concat(advance.formFields).map(item => item.field)
    let arr = [...new Set(fields)]
    arr.forEach(key => queryParams[key] = null)
}

// 高级查询
function handleQuery(form) {
    queryParams = Object.assign(queryParams, form)
    getDataList()
}

// 获取表格列配置并更新
async function getColumnList() {
    let { data } = await getTableConfig(props.baseUrl, { fmId: props.fmId })
    let columns = data.columns
    formatColumns(columns)
    gridOptions.columns = columns
    grid.value.reloadColumn(columns)
}

// 初始获取表格配置
async function getTableConf() {
    gridOptions.loading = true
    let { data } = await getTableConfig(props.baseUrl, { fmId: props.fmId })
    formatGridOptions(data)
    gridOptions = Object.assign(gridOptions, data)
    await getDataList()
}
// 下拉表格change事件
function changeEvent(data, value) {
    let { column, row } = data
    let rowData = Object.assign(row, value)
    grid.value.reloadRow(row, rowData)
}
// 更新单行数据
function updateDataRow(data) {
    updateRow(props.baseUrl, { fmId: props.fmId, data }).then(({ code, message }) => {
        if (code !== 200) handleMsg({ code, message })
    })
}
// 删除单行数据
async function removeDataRow() {
    let res = await deleteData(props.baseUrl, { fmId: props.fmId, id: delDataId.value })
    handleMsg(res)
    if (res.code !== 200) return
    delDataId.value = ''
    delVisible.value = false
    getDataList()
}

// 更新表格列配置
async function updateColumnsConf() {
    if (isSorted.value) setColumnSort()
    // 转换列配置，包括部分无法保存到数据库的字段
    gridOptions.columns.forEach((column) => {
        column.fixed = column.isFixed ? 'left' : ''
        column.showState = column.visible ? 1 : 2
        column.slots = convertSlots(column.slots)
        column.editRender = formatEditRender(column.editRender)
        column.externalRe = JSON.stringify(column.externalRe)
    })
    let res = await updateColumns(props.baseUrl, gridOptions.columns)
    handleMsg(res)
    if (res.code !== 200) return
    getColumnList()
    tableConfVisible.value = false
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
async function getDataList() {
    if(!gridOptions.loading) gridOptions.loading = true
    let params = {
        fmId: props.fmId,
        limit: pageMain.pageSize,
        page: pageMain.currentPage,
    }
    if(isDefaultQuery) {
        const form = dynamicForms.default.formFields[0]
        params[form.field] = form.defaultValue
    }
    params = Object.assign(params, queryParams)
    let {data} = await getPageList(props.baseUrl, params)
    gridOptions.loading = false
    setPageConf('main', data)
    if (grid.value) grid.value.reloadData(data.list)
}
// 更新分页数据
function setPageConf(name, { currentPage, pageSize, total, totalPage }) {
    if(name === 'main') {
        pageMain = Object.assign(pageMain, { currentPage, pageSize, total, totalPage })
    }else if(name === 'pop') {
        pagePop = Object.assign(pagePop, { currentPage, pageSize, total, totalPage })
    }
}

// 开启新增窗口
async function openForm(type) {
    emit('createRow')
    action.value = 'create'
    creationFormVisible.value = true
}
// 分页更新
function handlePageChange(name, { type, currentPage, pageSize }) {
    if(name === 'main') {
        type === 'current' ? pageMain.currentPage = currentPage : ''
        type === 'size' ? pageMain.pageSize = pageSize : ''
    }else if(name === 'pop') {
        type === 'current' ? pagePop.currentPage = currentPage : ''
        type === 'size' ? pagePop.pageSize = pageSize : ''
    }
}
// 拖拽调整列宽
async function handleColumnResize(columnData) {
    let { field, resizeWidth } = columnData.column
    let column = gridOptions.columns.find((item) => item.field === field)
    if (!column) return
    let config = {
        ...column,
        width: resizeWidth,
        slots: convertSlots(column.slots),
        externalRe: JSON.stringify(column.externalRe),
        editRender: formatEditRender(column.editRender)
    }
    await updateColumn(props.baseUrl, config)
    let { data } = await getTableConfig(props.baseUrl, { fmId: props.fmId })
    formatColumns(data.columns)
    grid.value.reloadColumn(data.columns)
}
// 保存选中列id，用于用户调整排序
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
    if (direction === 'up') { // 排序上移
        if (currIndex < 1) return
        let currItem = gridOptions.columns[currIndex]
        gridOptions.columns[currIndex] = gridOptions.columns[currIndex - 1]
        gridOptions.columns[currIndex - 1] = currItem
    } else if (direction === 'down') { // 排序下移
        if (currIndex + 1 >= gridOptions.columns.length) return
        let currItem = gridOptions.columns[currIndex]
        gridOptions.columns[currIndex] = gridOptions.columns[currIndex + 1]
        gridOptions.columns[currIndex + 1] = currItem
    }
    if (configTable.value) configTable.value.reloadData(gridOptions.columns)
}

// 转换editRender配置
function formatEditRender(render) {
    if (isString(render)) { // string => obj & function
        render = JSON.parse(render)
        render.events.change = eval(render.events.change)
    } else { // obj & function => string
        render.events.change = (() => {}).toString()
        render = JSON.stringify(render)
    }
    return render
}

// 格式化gridOptions
function formatGridOptions(data) {
    data.editConfig = JSON.parse(data.editConfig)
    data.rowConfig = JSON.parse(data.rowConfig)
    data.toolbarConfig = JSON.parse(data.toolbarConfig)
    formatColumns(data.columns)
}

// 保存列配置前格式化转换字段
function formatColumns(columnList) {
    columnList.forEach((item) => {
        item.fixed === 'left' ? (item.isFixed = true) : ''
        if (item.externalRe) item.externalRe = JSON.parse(item.externalRe)
        item.visible = item.showState === 1
        item.slots = convertSlots(item.slots)
        item.editRender = formatEditRender(item.editRender)
    })
}

// 转换插槽配置
function convertSlots(slots) {
    if (isString(slots)) { // string => obj & function
        if (!slots) return {};
        let newSlots = JSON.parse(slots);
        Object.keys(newSlots).forEach((key) => {
            if (!isString(newSlots[key]) || !newSlots[key].includes('=>')) return
            newSlots[key] = eval(newSlots[key]);
        });
        return newSlots;
    } else { // obj & function => string
        if (!slots) return JSON.stringify({})
        Object.keys(slots).forEach((key) => {
            // if(typeof slots[key] !== 'function') return
            let fnStr = slots[key].toString()
            if (fnStr.includes('React.createElement')) { // 将底层的dom生成由react转为vue的方法
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
        span:last-of-type {
            display: flex;
            align-items: center;
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
:deep(.ant-btn) {
    margin-left: 10px;
}
</style>
