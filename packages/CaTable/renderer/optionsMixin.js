import request from '@/utils/request'
export default {
  props: {
    optionsUrl: {
      type: String,
      required: true
    },
    optionProp: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayLabel() {
      const {
        value: valueKey,
        label: labelKey
      } = this.optionProp
      const foundOption = this.options.find(option => option[valueKey] === this.internalValue)
      return foundOption ? foundOption[labelKey] : this.internalValue
    }
  },
  data() {
    return {
      options: [],
    }
  },
  created() {
    this.fetchOptions()
  },
  mounted() {
      // this.fetchOptions()
  },
  methods: {
    /**
     * 执行获取选项操作，返回Promise
     */
    async doFetchOptions() {
      return new Promise(async(resolve, reject) => {
        const params = {
          prop: this.column.property,
          ...this.params
        }
        const { code, data: options } = await request.get(this.optionsUrl, {
          params
        })
        if (code === 200) {
          if (Array.isArray(options)) {
            return resolve(options)
          }
          console.warn(`[SelectCell.fetchOptions(${this.optionsUrl})]: 获取下拉框选项必须返回一个数组`)
          return resolve([])
        }
        reject()
      })
    },
    fetchOptions() {
      // 正在获取选项，跳过
      if (this.index === 0) {
        const params = {
          prop: this.column.property,
          ...this.params
        }
        request.get(this.optionsUrl, { params }).then(res => {
          this.$emit('setOptionData',res.data, this.column)
        })
      }
    }
  }
}
