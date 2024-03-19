<script>
import { get, set } from 'lodash'
export default {
  name: 'InputCell',
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
    formatter: {
      type: Function,
      default: undefined
    },
  },
  render(h, context) {
    const {
      row,
      column,
      formatter
    } = context.props || {}
    const onInput = (value) => {
      set(row, column.property, value)
    }
    const onBlur = () => {
      set(row, '_editing', false)
    }
    if (row._isEditing) {
      return (
        <el-input
          autofocus
          value={ get(row, column.property, '') }
          onInput={ onInput }
          onBlur={ onBlur }
        ></el-input>
      )
    } else {
      const cellValue = get(row, column.property, '')
      const formattedCellValue = typeof formatter === 'function' ? formatter(row, column, cellValue) : cellValue
      return (
        <span>{ formattedCellValue }</span>
      )
    }
  }
}
</script>
