<script>
import { get, set } from 'lodash'
import { reactiveSet } from '@/utils'
export default {
  name: 'DatePickerCell',
  functional: true,
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    column: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: -1
    },
    columnProp: {
      type: Object,
      required: true
    },
    columnConfig: {
      type: Object,
      required: true
    }
  },
  render(h, context) {
    const {
      row,
      column,
      columnProp,
      columnConfig
    } = context.props || {}
    const {
      renderer: rendererKey
    } = columnProp
    let renderer
    try {
      renderer = JSON.parse(columnConfig[rendererKey])
    } catch (err) {
      console.error(err)
      renderer = {}
    }
    const { options = {} } = renderer
    const onInput = (value) => {
      reactiveSet(row, column.property, value)
    }
    const onClick = (e) => {
      e.stopPropagation()
    }
    return (
      <el-date-picker
        disabled={!row._isEditing}
        value-format="yyyy-MM-dd HH:mm:ss"
        value={ get(row, column.property, undefined) }
        { ...{ props: options } }
        onInput={ onInput }
        nativeOnClick={ onClick }
      ></el-date-picker>
    )
  }
}
</script>
