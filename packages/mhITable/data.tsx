
export const configTableColumns = [
  {
    title: '列名',
    dataIndex: 'originalTitle',
    key: 'originalTitle',
    align: 'center',
    scopedSlots: { customRender: 'originalTitle' },
  },
  {
    title: '列字段',
    dataIndex: 'field',
    key: 'field',
    align: 'center',
    scopedSlots: { customRender: 'field' },
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    key: 'remarks',
    align: 'center',
    scopedSlots: { customRender: 'remarks' },
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
    attrs: { type: 'number' },
    events: {
      change: () => {}
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
  { label: '靠左', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '靠右', value: 'right' },
];
