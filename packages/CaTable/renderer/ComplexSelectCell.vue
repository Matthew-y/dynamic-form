<template>
  <complex-select
    v-if="isEditing"
    v-model="internalValue"
    v-bind="presetConfig"
    v-on="$listeners"
  ></complex-select>
  <span v-else>{{ displayLabel }}</span>
</template>

<script>
import ComplexSelect from '@/components/ComplexSelect'
import baseMixin from './baseMixin'
export default {
  components: {
    ComplexSelect
  },
  mixins: [baseMixin],
  computed: {
    presetConfig() {
      const { renderer: rendererKey } = this.columnProp
      const renderer = this.columnConfig[rendererKey]
      const { options } = renderer ? JSON.parse(renderer) : {}
      const { preset: presetName } = options
      const preset = this.presets[presetName]
      if (preset) {
        return preset
      }
      console.error(`[CaTable.ComplexSelect]: 未找到复杂选择器预设[${preset}]`)
      this.$message.error(`[CaTable.ComplexSelect]: 未找到复杂选择器预设[${preset}]`)
      return {}
    },
    displayLabel() {
      const { multiple } = this.presetConfig
      if (multiple && Array.isArray(this.internalValue)) {
        return this.internalValue.map(item => item.label).join('、')
      } else {
        if (this.internalValue && this.internalValue.hasOwnProperty('label')) {
          return this.internalValue.label
        }
      }
      return ''
    }
  },
}
</script>
