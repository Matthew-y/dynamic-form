<template>
    <div class="box">
        <div class="search">
            <div class="dfa mb20">
                <div class="tit">常用方案：</div>
            </div>
            <div class="mb20 condition">
                <div class="tit">高级查询：</div>
                <div class="filter-box">
                    <div class="filter dfa" v-for="(component, i) in searchParams" :key="i">
                        <Select @change="value => searchKeyChange(i, value)" v-model:value="component.key" style="width: 120px; margin-right: 10px;">
                            <SelectOption v-for="option in columns" :value="option.value">{{ option.label }}</SelectOption>
                        </Select>
                        <Select v-model:value="component.symbol" style="width: 120px; margin-right: 10px;">
                            <SelectOption v-for="option in symbolList" :value="option.value">{{ option.label }}</SelectOption>
                        </Select>
                        <Input v-if="is(component, 'input')" v-model:value="component.value" allowClear style="width: 120px" />
                        <DatePicker v-else-if="is(component, 'datePicker')" v-model:value="component.value" value-format="YYYY-MM-DD" style="width: 300px" />
                        <span class="pointer del" @click="searchParams.splice(i, 1)">删除</span>
                    </div>
                    <div class="add-filter">
                        <span @click="addFilter" style="margin-right: 10px">+ 添加条件</span>
                    </div>
                </div>
            </div>
            <div class="dfa">
                <div class="tit">方案名称：</div>
                <Input placeholder="输入方案名称" style="width: 300px" />
                <Button style="margin-left: 10px" @click="createPlan">保存方案</Button>
                <Button style="margin-left: 10px" type="primary" @click="confirmSearch">查询</Button>
            </div>
        </div>
        <div class="table">
            <vxe-grid ref="grid" v-bind="gridOptions"></vxe-grid>
        </div>
    </div>
    <Modal v-model:open="planModalVisible" title="查询方案">
        <vxe-grid v-bind="planGridOptions"></vxe-grid>
    </Modal>
</template>

<script setup>
import {reactive, ref, computed, watch} from 'vue'
import { Select, SelectOption, Input, Button, DatePicker, Modal } from "ant-design-vue";
import {getAltQueryPlan, getPageList, getTableConfig, createQueryPlan} from "../../packages/utils/api.js";
import {isString} from "../../packages/utils/tool.ts";

const fmId = '1645965546058481666'
const baseUrl = '/request'
const grid = ref(null)
const planModalVisible = ref(true)

let searchParams = reactive([
    { key: '', value: '', symbol: '', inputType: 'input' },
])
let symbolList = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '大于等于', value: 'ge' },
    { label: '小于等于', value: 'le' },
    { label: 'null', value: 'isnull' },
    { label: '不为null', value: 'isnotnull' },
    { label: '关键字', value: 'like' },
    { label: '多值', value: 'in' },
]

let gridOptions = reactive({ columns: [] })
let planGridOptions = reactive({
    columns: [
        { field: 'enterpriseName', title: '企业名称' },
        { field: 'legalRepresentative', title: '法人' },
    ]
})

watch(
    searchParams,
    (newVal, oldVal) => {
        if(newVal !== oldVal) return
        newVal.forEach(item => {

        })
    }
)

const columns = computed(() => {
    let visibleColumns = gridOptions.columns.filter(column => column.isQueryScheme)
    return visibleColumns.map(column => ({ label: column.title, value: column.field }))
})
const queryParams = computed(() => {
    let params = {}
    searchParams.forEach(item => {
        if(!item.value) return
        params[`${item.key}-#@#-${item.symbol}`] = item.value
    })
    return params
})

getTableConf()
getAltQueryPlan(baseUrl, { fmId }).then(res => console.log(res))

async function getTableConf() {
    gridOptions.loading = true
    let { data } = await getTableConfig(baseUrl, { fmId })
    formatGridOptions(data)
    console.log(data)
    gridOptions = Object.assign(gridOptions, data)
    await getDataList()
}

async function getDataList() {
    if(!gridOptions.loading) gridOptions.loading = true
    let params = Object.assign({ fmId, limit: 10, page: 1 }, queryParams.value)
    console.log(params)
    let {data} = await getPageList(baseUrl, params)
    gridOptions.loading = false
    // setPageConf('main', data)
    if (grid.value) grid.value.reloadData(data.list)
}

async function createPlan() {
    let params = { fmId, formFields: [] }
    let { data } = await createQueryPlan(baseUrl, { dto: {} })
}

function confirmSearch() {
    let emptyParams = searchParams.filter(item => !Boolean(item.label) || Boolean(item.symbol))
    if(emptyParams.length > 0) return
    getDataList()
}

function addFilter() {
    searchParams.push({ key: '', value: '', symbol: '', inputType: 'input' })
}

function formatGridOptions(data) {
    data.editConfig = JSON.parse(data.editConfig)
    data.rowConfig = JSON.parse(data.rowConfig)
    data.toolbarConfig = JSON.parse(data.toolbarConfig)
    formatColumns(data.columns)
}

function formatColumns(columnList) {
    columnList.forEach((item) => {
        item.fixed === 'left' ? (item.isFixed = true) : ''
        if (item.externalRe) item.externalRe = JSON.parse(item.externalRe)
        item.visible = item.showState === 1
        item.slots = convertSlots(item.slots)
        item.editRender = formatEditRender(item.editRender)
    })
}

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

function searchKeyChange(i, value) {
    let isTimeKey = value.includes('Time') || value.includes('time')
    let isTimePicker = searchParams[i].inputType === 'datePicker'
    if(isTimeKey === isTimePicker) return
    searchParams[i].inputType = isTimeKey ? 'datePicker' : 'input'
}

function is({ inputType }, type) {
    return inputType === type
}
</script>

<style scoped lang="scss">
.box {
    padding: 40px;
    .search {
        padding: 15px;
        border: 1px solid #dddddd;
        background-color: #fafafa;
        .condition {
            display: flex;
        }
        .tit {
            color: #777;
        }
        .filter {
            margin-bottom: 10px;
        }
        .add-filter {
            padding: 5px;
            span {
                padding: 2px;
                font-size: 14px;
                color: #0078b9;
                border: 1px solid #0078b9;
                cursor: pointer;
                user-select: none;
            }
        }
        .del {
            font-size: 14px;
            margin-left: 10px;
        }
    }
}
.dfa {
    display: flex;
    align-items: center;
}
.mb20 {
    margin-bottom: 20px;
}
.pointer {
    cursor: pointer;
    user-select: none;
}
</style>