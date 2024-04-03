import type { TreeProps } from 'ant-design-vue';

export const data: TreeProps = [
    {
        name: 'Parent 1',
        id: '1-1',
        children: [
            {
                title: 'child 1',
                key: '1-1-1'
            }
        ]
    }
]

export const basicFormProps = {
    schemas: [],
    labelCol: {
        // style: { marginLeft: '10px' }
    },
    labelWidth: 140,
    // showActionButtonGroup: false,
    resetButtonOptions: { text: '清空' },
    submitButtonOptions: { text: '确定' },
    actionColOptions: { span: 24 },
}