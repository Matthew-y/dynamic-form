import { get } from 'lodash'
import { reactiveSet } from '@/utils'
import request from '@/utils/request'

export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: undefined
    },
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
    columnConfig: {
      type: Object,
      required: true
    },
    columnProp: {
      type: Object,
      required: true
    },
    presets: {
      type: Object,
      required: true
    }
  },
  computed: {
    internalValue: {
      get() {
        return get(this.row, this.column.property, undefined)
      },
      set(value) {
        reactiveSet(this.row, this.column.property, value)
      }
    },
    isEditing() {
      return this.row._isEditing
    }
  },
  watch: {

  },
  data() {
    return {
      columnData: [],
      selectOption: []
    }
  },
  mounted() {

  },
  methods: {
    selectCellClick(val,row) {
      this.$emit('selectCellClick', this.index, this.columnConfig)
    },
    async selectCellClicktest(obj) {
      if (parseInt(obj.linkageType) === 2) {
        this.options = JSON.parse(obj.origin)
      }else if (parseInt(obj.linkageType) === 3) {
        const url = obj.origin
        const params = {
          prop: obj.triggername,
          ...this.params
        }
        const { code, data } = await request.get(url,({ params }))
        if (code === 200) {
          this.options = data
        }
      }else if (parseInt(obj.linkageType) === 4) {
        const url = this.optionsUrl
        const params = {
          prop: obj.origin,
          ...this.params
        }
        const { code, data } = await request.get(url,({ params }))
        if (code === 200) {this.options = data}
      }
    },
    roleNameChange (val) {
      if (this.columnConfig.linkage) {
        if (this.column.property === this.columnConfig.triggername) {
          if (parseInt(this.columnConfig.linkageType) === 1) {
            this.row[this.columnConfig.target] = this.columnConfig.origin
          }else {
            this.selectCellClick()
          }
        }
      }
    }
  }
}
