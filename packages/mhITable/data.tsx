import { type FormSchema } from 'vben-components';

const colProps = {
    span: 8,
};

export const schemas: FormSchema[] = [
    {
        field: 'title',
        component: 'Input',
        label: '标题',
        colProps,
        componentProps: {
            placeholder: '给目标起个名字',
        },
        required: true,
    },
    {
        field: 'time',
        component: 'RangePicker',
        label: '起止日期',
        colProps,
        required: true,
    },
    {
        field: 'client',
        component: 'Input',
        colProps,
        label: '客户',
        helpMessage: '目标的服务对象',
        subLabel: '( 选填 )',
        componentProps: {
            placeholder: '请描述你服务的客户，内部客户直接 @姓名／工号',
        },
    },
    {
        field: 'weights',
        component: 'InputNumber',
        label: '权重',
        colProps,
        subLabel: '( 选填 )',
        componentProps: {
            formatter: (value: string | number) => (value ? `${value}%` : ''),
            parser: (value: string) => Number(value.replace('%', '')),
            placeholder: '请输入',
        },
    },
    {
        field: 'target',
        component: 'InputTextArea',
        label: '目标描述',
        colProps,
        componentProps: {
            placeholder: '请输入你的阶段性工作目标',
            rows: 4,
        },
        required: true,
    },
    {
        field: 'metrics',
        component: 'InputTextArea',
        label: '衡量标准',
        colProps,
        componentProps: {
            placeholder: '请输入衡量标准',
            rows: 4,
        },
        required: true,
    },

    {
        field: 'inviteer',
        component: 'Input',
        label: '邀评人',
        colProps: {
            span: 8,
        },
        subLabel: '( 选填 )',
        componentProps: {
            placeholder: '请直接 @姓名／工号，最多可邀请 5 人',
        },
    },
    {
        field: 'disclosure',
        component: 'RadioGroup',
        label: '目标公开',
        colProps: {
            span: 16,
        },
        itemProps: {
            extra: '客户、邀评人默认被分享',
        },
        componentProps: {
            options: [
                {
                    label: '公开',
                    value: '1',
                },
                {
                    label: '部分公开',
                    value: '2',
                },
                {
                    label: '不公开',
                    value: '3',
                },
            ],
        },
    },
    {
        field: 'disclosure',
        component: 'Select',
        label: ' ',
        colProps: {
            span: 8,
        },
        show: ({ model }) => {
            return model.disclosure === '2';
        },
        componentProps: {
            placeholder: '公开给',
            mode: 'multiple',
            options: [
                {
                    label: '同事1',
                    value: '1',
                },
                {
                    label: '同事2',
                    value: '2',
                },
                {
                    label: '同事3',
                    value: '3',
                },
            ],
        },
    },
];

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

export const configTableColumns = [
    {
        title: '列名',
        dataIndex: 'originalTitle',
        key: 'originalTitle',
        align: 'center',
        scopedSlots: {customRender: 'originalTitle'},
    },
    {
        title: '列字段',
        dataIndex: 'field',
        key: 'field',
        align: 'center',
        scopedSlots: {customRender: 'field'},
    },
    {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks',
        align: 'center',
        scopedSlots: {customRender: 'remarks'},
    },
];

export const gridOptions = {
    loading: false,
    border: true,
    resizable: true,
    showOverflow: 'tooltip',
    height: 300,
    align: 'left',
    columns: [],
    editRender: {
        name: 'input',
        defaultValue: ({column}) => column.field,
        attrs: {type: 'number'},
        events: {
            change: () => {
            }
        }
    },
    editConfig: {
        enabled: true,
        mode: 'row',
        showIcon: false,
    },
    data: []
}


export const alignOptions = [
    {label: '靠左', value: 'left'},
    {label: '居中', value: 'center'},
    {label: '靠右', value: 'right'},
];

export const treeConfig = {
  transform: true,
  indent: 20,
  keyField: 'id',
  parentField: 'pid',
  childrenField: 'children',
  showLine: true,
  expandAll: true,
  expandRowKeys: [],
  accordion: false,
  lazy: false,
  trigger: 'row',
  reserve: false,
  showIcon: true,
}
export const gridPop = {
    rowConfig: {
        isCurrent: true,
        useKey: true,
        keyField: 'id',
        isHover: true
    },
    treeConfig,
    showOverflow: true,
    loading: false,
    columns: [
        { field: 'name', title: '名称', align: 'center', treeNode: true },
        { field: 'age', title: '年龄', align: 'center', }
    ],
    data: [
        { name: 'matt', age: '23', id: '1211' },
        { name: 'barry', age: '33', pid: '1211', id: '1937', },
        { name: 'alex', age: '14', id: '1422', }
    ]
}

