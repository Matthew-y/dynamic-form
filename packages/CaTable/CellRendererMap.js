// import Vue from 'vue'
// import { get } from 'lodash'
export default class CellRendererMap {
  map = {};

  constructor() {
    this._init()
  }

  _init() {
    import('./renderer/StaticCell').then(mod => this.register('static', mod.default))
    import('./renderer/InputCell').then(mod => this.register('text', mod.default))
    import('./renderer/SelectCell').then(mod => this.register('select', mod.default))
    import('./renderer/ComplexSelectCell').then(mod => this.register('complex-select', mod.default))
    import('./renderer/DatePickerCell').then(mod => this.register('date-picker', mod.default))
  }

  register(type, component) {
    this.map[type] = component
  }

  getComponent(type) {
    return this.map[type] || this.map['static']
  }
}
