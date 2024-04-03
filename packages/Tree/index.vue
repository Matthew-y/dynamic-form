
<template>
    <div class="tree-toolbar">
        <Button type="primary" @click="() => { editStorage = {}; openModal('新增') }">新增</Button>
    </div>
    <Tree :treeData="treeData" :field-names="treeFieldNames" blockNode checkable>
        <template #title="{ id: treeKey, name: title }">
            <Dropdown overlayClassName="tree-title" :trigger="['contextmenu']">
                <span class="tree-title">{{ title }}</span>
                <template #overlay>
                    <Menu @click="({ key: menuKey }) => rightMenuClick(treeKey, menuKey)">
                        <MenuItem key="generate">新增子级</MenuItem>
                        <MenuItem key="edit">编辑</MenuItem>
                        <MenuItem key="del">删除</MenuItem>
                    </Menu>
                </template>
            </Dropdown>
        </template>
    </Tree>
    <Modal v-model:open="modalVisible" :title="modalTitle" :footer="null">
        <BasicForm @register="register" />
    </Modal>
    <Modal v-model:open="delStatus.visible" title="请确认" @ok="deleteData">
        <span>确认删除此条数据吗？</span>
    </Modal>
</template>

<script>
export default { name: 'Tree' }
</script>
<script setup>
import { Tree, Button, Modal, Dropdown, Menu, MenuItem } from 'ant-design-vue'
import { BasicForm, useForm } from 'vben-components'
import { reactive, ref, watch, nextTick } from "vue";
import { flattenDeep } from "lodash";
import { basicFormProps } from "./data.ts";
import { getTree, getCreateForm, createTreeData, updateTreeData, deleteTreeData } from "../utils/api.js";
import { formatFormFields, showObjStr } from "../utils/tool.ts";

const props = defineProps({
    baseUrl: {
        type: String,
        default: () => '/'
    },
    fmId: {
        type: String,
        default: () => ''
    }
})

const modalVisible = ref(false)
let delStatus = reactive({ visible: false, id: '', ids: [] })
const modalTitle = ref('新增')

const treeFieldNames = {
    key: 'id',
    title: 'name',
    children: 'children'
}

let treeData = ref([])
let schemas = reactive([])
let editStorage = {}
let flatTreeData = []

const [register, basicFormMethod] = useForm({
    ...basicFormProps,
    submitFunc: () => {
        let data = Object.assign(editStorage, basicFormMethod.getFieldsValue())
        console.log(data)
        let actions = {
            '新增': () => createData(data),
            '编辑': () => updateData(data)
        }
        actions[modalTitle.value]()
    }
})

/*watch(
    () => modalVisible.value,
    value => {
        if(value) getForm(['', '新增', '编辑'].indexOf(modalTitle.value))
    }
)*/

// showObjStr({ span: 24 })
getTreeData()

async function openModal(type = null) {
    type ? modalTitle.value = type : ''
    modalVisible.value = true
    await getForm(['', '新增', '编辑'].indexOf(modalTitle.value))
}

async function rightMenuClick(treeKey, option) {
    if(option === 'del') {
        delStatus.id = treeKey
        return delStatus.visible = true
    }
    let title = { generate: '新增', edit: '编辑' }
    Object.keys(title).includes(option) ? modalTitle.value = title[option] : ''
    editStorage = { pid: treeKey }
    if(option === 'edit') editStorage = flatTreeData.find(node => node.id === treeKey)
    await openModal()
    await nextTick(() => basicFormMethod.setFieldsValue(editStorage))

}

async function getTreeData() {
    let { data } = await getTree(props.baseUrl, { fmId: '123797979237492394' })
    treeData.value = data
    flatTreeData = flattenDeep(data.map(node => [node, ...(node.children || [])]))
    console.log('Tree Data\n', treeData.value)
}

async function getForm(type) {
    let { data } = await getCreateForm(props.baseUrl, { fmId: '123797979237492394', updateOrCreate: type })
    console.log('Fields\n', data.formList)
    formatFormFields(data.formList)
    basicFormMethod.resetSchema(data.formList)
}

async function createData(data) {
    let res = await createTreeData(props.baseUrl, { fmId: '123797979237492394', data: data })
    if(res.code !== 200) return
    modalVisible.value = false
    await getTreeData()
}

async function updateData(data) {
    let res = await updateTreeData(props.baseUrl, { fmId: '123797979237492394', data })
    if(res.code !== 200) return
    modalVisible.value = false
    await getTreeData()
}

async function deleteData() {
    let res = await deleteTreeData(props.baseUrl, { fmId: '123797979237492394', id: delStatus.id, ids: delStatus.ids })
    if(res.code !== 200) return
    delStatus.visible = false
    await getTreeData()
}
</script>
<style scoped lang="scss">
.tree-toolbar {
    padding: 10px;
    margin-bottom: 10px;

    button:first-child {
        margin-right: 10px;
        margin-left: 0;
    }
}
:deep(.ant-btn) {
    margin-left: 10px;
}
:deep(.ant-tree) {
}
.ant-tree {
    .ant-tree-title {
        width: 100%;
        display: block;
        .ant-dropdown-trigger {
            width: 100%;
            display: block;
        }
    }
}
</style>