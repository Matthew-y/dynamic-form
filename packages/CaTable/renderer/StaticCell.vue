<script>
import { get } from 'lodash'
export default {
  name: 'StaticCell',
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
    }
  },
  render(h, context) {
    const {
      row,
      column,
      formatter,
      index
    } = context.props || {}
    const cellValue = get(row, column.property, '')
    const formattedCellValue = typeof formatter === 'function' ? formatter(row, column, cellValue, index) : cellValue
    return (
      <span>{ formattedCellValue }</span>
    )
  }
}
</script>
