<template>
  <el-select v-if="isEditing" v-model="internalValue" filterable @change="roleNameChange">
    <el-option
      ref="option"
      v-for="option in options"
      :key="option[optionProp.value] || option[optionProp.label]"
      :label="option[optionProp.label] || option[optionProp.value]"
      :value="option[optionProp.value] || option[optionProp.label]"
    />
  </el-select>
  <span v-else>{{ displayLabel }}</span>
</template>

<script>
import baseMixin from './baseMixin'
import optionsMixin from './optionsMixin'

export default {
  name: 'SelectCell',
  mixins: [baseMixin, optionsMixin],
}
</script>
