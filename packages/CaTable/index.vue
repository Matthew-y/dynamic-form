<template>
  <!-- ca-table: Column Attributed Table列属性表格 -->
  <div class="c-ca-table" @keyup.esc="_handleResetCurrentRow">
    <div class="c-ca-table__table" v-loading="dataFetchLoading" :element-loading-text="elementLoadingText">
      <el-table
        ref="elTable"
        class="c-ca-table__table"
        :data="internalData || []"
        :height="height"
        :row-key="rowKey"
        highlight-current-row
        border
        v-bind="$attrs"
        :row-style="rowStyle"
        :cell-style="cellStyle"
        :header-row-style="headerRowStyle"
        :header-cell-style="headerCellStyle"
        :row-class-name="rowClassName"
        v-on="tableListeners"
        :expand-row-keys="expands"
        @cell-click="handleCell"
        @row-click="handleRowClick"
        @row-dblclick="handleDoubleClick"
        @current-change="_handleTableCurrentChange"
        @header-dragend="_handleHeaderDragend"
        @sort-change="_handleSortChange"
        @row-contextmenu="_handleRowContextMenu"
      >
        <el-table-column v-if="showSelection" type="selection"/>
        <el-table-column
          v-for="(displayColumn, index) in displayColumns || []"
          :key="_getColumnKey(displayColumn, index)"
          v-bind="{ ...displayColumn, ..._getPreset(displayColumn) }"
          height="30px"
          :prop="displayColumn[columnProp.prop]"
          :label="displayColumn[columnProp.label] || displayColumn[columnProp.name]"
          :width="displayColumn[columnProp.width] == 0? 'auto':displayColumn[columnProp.width]"
          :align="displayColumn[columnProp.align]"
          :sortable="_getColumnSortable(displayColumn)"
          :resizable="!displayColumn[columnProp.resizable]"
          :formatter="undefined"
          @keyup.esc="KeyUpEsc()"
        >
          <template slot-scope="{ row, column, $index: dataIndex }" @keyup.esc="KeyUpEsc()">
            <component
              ref="componentRefs"
              @keyup.esc="KeyUpEsc()"
              :is="_getComponentName(displayColumn[columnProp.renderer])"
              :key="row[rowKey] || dataIndex"
              :name="name"
              :params="params"
              :row="row"
              :column="column"
              :index="dataIndex"
              :column-config="displayColumn"
              :column-prop="columnProp"
              :options-url="optionsUrl"
              :option-prop="optionProp"
              :presets="presets"
              :formatter="_getColumnFormatter(displayColumn)"
              @selectCellClickData="selectCellClickData"
              @setOptionData="setOptionData"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="showRowOperation" label="操作" :fixed="operationFixed" :width="operationWidth" :resizable="operationResizable">
          <template slot-scope="{ row, column, $index }">
            <slot name="row-operation" :row="row" :column="column" :$index="$index"/>
          </template>
        </el-table-column>
      </el-table>
      <!--565665-->
      <!--<el-table-->
      <!--border-->
      <!--v-if="pageable"-->
      <!--:data="tableData"-->
      <!--style="width: 100%"-->
      <!--&gt;-->
        <!--<el-table-column prop="data" label="日期" width="80px">-->
        <!--</el-table-column>-->
        <!--<el-table-column prop="data" label="日期" width="80px">-->
        <!--</el-table-column>-->
        <!--<el-table-column prop="data" label="日期" width="80px">-->
        <!--</el-table-column>-->
      <!--</el-table>-->
    </div>
    <div class="c-ca-table__pagination">
      <el-pagination
        v-if="pageable"
        ref="pagination"
        :current-page.sync="paginationQuery.currentPage"
        :page-size.sync="paginationQuery.pageSize"
        :page-sizes="[1,10,20,30]"
        :total="total"
        :layout="layout"
        v-bind="$attrs"
        v-on="$listeners"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <div class="queryShow" v-if="queryCondition.num !== undefined && queryCondition.num !== 0">
      <el-checkbox v-if="searchList !== null" v-model="checked" style="margin: 0"/>
      <el-button type="text" @click="changeShow()">{{ searchList }}</el-button>
    </div>
    <el-button
      v-if="dialogButton"
      class="c-ca-table__edit-btn"
      type="text"
      icon="el-icon-menu"
      @click="_openPropertiesDialog"
    />
    <el-dialog
      title="列属性面板"
      :visible.sync="propertiesDialogVisible"
      append-to-body
      @closed="_handlePropertiesDialogClose"
    >
      <div class="c-ca-table__panel">
        <el-table
          :data="displayEditingColumns"
          highlight-current-row
          @current-change="_handlePanelTableCurrentChange"
        >
          <el-table-column type="index" fixed="left"/>
          <el-table-column :prop="columnProp.name" label="列名" fixed="left"/>
          <el-table-column :prop="columnProp.order" label="顺序" width="80px"/>
          <el-table-column label="显示名称" width="120px">
            <template slot-scope="{ row }">
              <el-input v-model="row[columnProp.label]"/>
            </template>
          </el-table-column>
          <el-table-column label="宽度" width="80px" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row[columnProp.width]" class="c-ca-table__panel__input-number"
                               :controls="false"/>
            </template>
          </el-table-column>
          <el-table-column label="显示方向" width="120px">
            <template slot-scope="{ row }">
              <el-select v-model="row[columnProp.align]">
                <el-option value="left" label="靠左"/>
                <el-option value="center" label="居中"/>
                <el-option value="right" label="靠右"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="是否显示" width="80" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row[columnProp.visible]"/>
            </template>
          </el-table-column>
          <!--<el-table-column label="排序" width="80" align="center">-->
          <!--<template slot-scope="{ row }">-->
          <!--<el-checkbox v-model="row[columnProp.sortable]" />-->
          <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column label="锁定" width="80" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row[columnProp.resizable]"/>
            </template>
          </el-table-column>
        </el-table>
        <div class="c-ca-table__panel__operations">
          <el-button :disabled="!prevPanelTableRow" @click="_moveUp">上移</el-button>
          <el-button :disabled="!nextPanelTableRow" @click="_moveDown">下移</el-button>
          <el-button @click="_saveColumns(displayEditingColumns)">保存</el-button>
          <el-button @click="_resetColumns">恢复默认</el-button>
        </div>
      </div>
    </el-dialog>
    <ul v-if="contextMenu.length !== 0" v-show="showContextMenu" :style="menuStyles" class="contextmenu">
      <li v-for="(item,index) in contextMenu" v-if="item.show === undefined ? true :item.show" :key="index"
          @click="item.clickEvent(currentLine)">
        <i v-if="item.icon" :class="item.icon"></i>
        <span>{{ item.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
  import { get } from 'lodash'
  import Clickoutside from 'element-ui/src/utils/clickoutside'
  import Logger from '@/utils/logger'
  import request from '@/utils/request'
  import { isUnset, deepClone } from '@/utils/index'
  import CellRendererMap from './CellRendererMap'

  export default {
    name: 'CaTable',
    componentName: 'CaTable',
    directives: {
      Clickoutside
    },
    props: {
      // 高级查询数据
      queryCondition: {
        type: Object,
        default: () => ({
          data: '',
          num: 0,
          condition: ''
        })
      },
      queryDataStatus: {
        type: Boolean,
        default: true
      },
      checked: {
        type: Boolean,
        default: false
      },
      advancedData: {
        type: String,
        default: () => {
        }
      },
      cellRendererMap: {
        type: CellRendererMap,
        default: () => new CellRendererMap()
      },
      // 外部传入数据，可用于前端分页
      data: {
        type: Array,
        default: () => []
      },
      dataTable: {
        type: Object,
        default: () => ({})
      },
      // 数据获取接口
      dataUrl: {
        type: String,
        default: ''
      },
      // 条件查询数据获取接口
      dataFilterUrl: {
        type: String,
        default: ''
      },
      // 外部传入列属性
      columns: {
        type: Array,
        default: () => []
      },
      // 列属性获取接口
      columnsUrl: {
        type: String,
        default: '/api/custom/column/get'
      },
      tableName: {
        type: String,
        default: ''
      },
      // 列属性保存接口
      columnsUpdateUrl: {
        type: String,
        default: '/api/custom/column/update'
      },
      // 默认配置接口
      columnsResetUrl: {
        type: String,
        default: '/api/custom/column/reset'
      },
      // 列属性各配置项key
      columnProp: {
        type: Object,
        default: () => ({
          prop: 'columns',
          name: 'columnName',
          label: 'displayName',
          align: 'displayAlign',
          width: 'columnWidth',
          order: 'columnSort',
          sortable: 'disSortBtu',
          resizable: 'lockColumn',
          visible: 'ifDisplay',
          renderer: 'editor',
          formatter: 'formatter'
        })
      },
      // 对请求的列属性进行处理
      handleColumns: {
        type: Function,
        default: undefined
      },
      // 单元格编辑状态，某些输入组件获取选项的接口
      optionsUrl: {
        type: String,
        default: '/api/column/options'
      },
      // 选项属性配置项key
      optionProp: {
        type: Object,
        default: () => ({
          value: 'value',
          label: 'label'
        })
      },
      // 表格名，所有接口调用均会附带此属性
      name: {
        type: String,
        default: ''
      },
      // 接口请求附加参数
      params: {
        type: Object,
        default: () => ({})
      },
      // 列属性接口请求附加参数
      columnParams: {
        type: Object,
        default: () => ({})
      },
      // 是否显示选择框
      showSelection: {
        type: Boolean,
        default: false
      },
      // 是否进行后端分页
      pageable: {
        type: Boolean,
        default: true
      },
      // 是否显示行操作列，具体操作按钮可通过作用域插槽传入
      showRowOperation: {
        type: Boolean,
        default: false
      },
      dialogButton: {
        type: Boolean,
        default: true
      },
      columnsStatus: {
        type: Boolean,
        default: false
      },
      // 操作列宽度
      operationWidth: {
        type: String,
        default: '60px'
      },
      operationFixed: {
        type: String,
        default: 'left'
      },
      operationResizable: {
        type: Boolean,
        default: true
      },
      // 分页组件布局
      layout: {
        type: String,
        default: 'total, sizes, prev, pager, next, jumper'
      },
      // 表格数据行主键，用于对表格数据查找，删除，替换等
      rowKey: {
        type: String,
        default: 'id'
      },
      // 组件高度，包含了分页
      height: {
        type: String,
        default: undefined
      },
      // 是否可编辑
      editable: {
        type: Boolean,
        default: false
      },
      // 是否自动保存行编辑数据，如果为true，将会在表格当前选中行改变是自动调接口保存数据。只有editable为true时生效
      // 如果为false，可手动调用接口保存
      autoSave: {
        type: Boolean,
        default: true
      },
      selectionState: {
        type: Boolean,
        default: false
      },
      // 输入组件预设配置
      presets: {
        type: Object,
        default: () => ({})
      },
      // 数据加载提示文本
      elementLoadingText: {
        type: String,
        default: '加载中，请稍候...'
      },
      contextMenu: {
        type: Array,
        default: () => []
      },
      rowClassName: {
        type: Function,
        default: undefined
      },
      doubleClickStatus: {
        type: Boolean,
        default: false
      },
      clickStatus: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        currentChangeRow: {},
        expands: [],
        showContextMenu: false,
        searchList: null,
        tableListeners: {},
        internalColumns: [],
        internalData: [],
        propertiesDialogVisible: false,
        editingColumns: [],
        currentPanelTableRow: null,
        paginationQuery: {
          currentPage: 1,
          pageSize: 10
        },
        rowStyle: { height: '30px' },
        cellStyle: { padding: 0 },
        headerRowStyle: { height: '30px' },
        headerCellStyle: { padding: 0 },
        sortQuery: {
          sort: null,
          order: null
        },
        total: 0,
        tableHeight: undefined,
        dataFetchLoading: false,
        currentLine: {},
        isSearch: false, // 是否使用data-filter-url作为数据url，只能通过fresh或者fetchData方法修改
        menuStyles: {
          background: '#fff',
          color: '#000',
          border: '1px',
          position: 'absolute',
          top: '0px',
          left: '0px',
          'z-index': '999',
          'box-shadow': '1px 1px 10px #888888'
        }
      }
    },
    computed: {
      isRemote() {
        return !!this.dataUrl
      },
      columnsFetcherParams() {
        return {
          tableName: this.name,
          ...this.columnParams
        }
      },
      columnsUpdateParams() {
        return {
          tableName: this.name,
          ...this.columnParams
        }
      },
      columnsResetParams() {
        return {
          tableName: this.name,
          ...this.columnParams
        }
      },
      dataFetcherInternalParams() {
        return {
          name: this.name,
          ...(this.pageable ? this.paginationQuery : {}),
          ...this.sortQuery
        }
      },
      dataFetcherParams() {
        const params = this.params
        if (!this.checked) {
          delete params.h
        }
        return {
          name: this.name,
          ...(this.pageable ? this.paginationQuery : {}),
          ...this.sortQuery,
          ...params
        }
      },
      visibleColumns() {
        return this.internalColumns.filter(column => column.ifDisplay !== false)
      },
      displayColumns() {
        const {
          order: orderKey
        } = this.columnProp
        const clonedColumns = this.visibleColumns.slice(0)
        return clonedColumns.sort((prev, cur) => +prev[orderKey] - +cur[orderKey])
      },
      displayEditingColumns() {
        const {
          order: orderKey
        } = this.columnProp
        const clonedColumns = this.editingColumns.slice(0)
        return clonedColumns.sort((prev, cur) => +prev[orderKey] - +cur[orderKey])
      },
      currentPanelTableRowIndex() {
        return this.displayEditingColumns.indexOf(this.currentPanelTableRow)
      },
      prevPanelTableRow() {
        if (this.currentPanelTableRowIndex > 0) {
          return this.displayEditingColumns[this.currentPanelTableRowIndex - 1] || null
        }
        return null
      },
      nextPanelTableRow() {
        if (this.currentPanelTableRowIndex > -1 && this.currentPanelTableRowIndex < this.displayEditingColumns.length - 1) {
          return this.displayEditingColumns[this.currentPanelTableRowIndex + 1] || null
        }
        return null
      }
    },
    watch: {
      editable: {
        handler(val, date) {
          console.log(val)
        }
      },
      'queryCondition.condition': {
        handler(val, date) {
          this.searchList = val
          if (val === undefined) {
            this.checked = false
          }
        },
        deep: true
      },
      'queryCondition.num': {
        handler(val, date) {
          if (this.checked === false) {
            this.checked = true
          } else {
            this.checked = true
            this.params.h = this.queryCondition.data
            this.fetchData(this.params, true)
          }
        },
        deep: true
      },
      checked: {
        handler(val, date) {
          if (val === true) {
            this.params.h = this.queryCondition.data
            this.fetchData(undefined, true)
          } else if (val === false) {
            delete this.params.h
            this.fetchData(undefined, true)
          }
        },
        deep: true
      },
      columns(columns) {
        this.internalColumns = columns || []
      },
      internalColumns(internalColumns) {
        this.$emit('columns-changed', internalColumns || [])
      },
      columnsFetcherParams: {
        deep: true,
        handler() {
          this._fetchColumns()
        }
      },
      data(data) {
        this.internalData = data || []
      },
      dataTable(dataTable) {
        this.paginationQuery.currentPage = dataTable.currentPage
        this.paginationQuery.pageSize = dataTable.page
        this.total = dataTable.total
        this.internalData = dataTable.rows
      },
      internalData(internalData) {
        this.$emit('data-changed', internalData || [])
      },
      dataFetcherInternalParams: {
        deep: true,
        handler() {
          setTimeout(() => {
            this.fetchData(undefined, this.isSearch)
          }, 200)
        }
      },
      params: {
        deep: true,
        handler() {
          // 外部条件改变调用条件查询接口
          this.fetchData(undefined, true)
          if (this.columnsStatus) {
            this._fetchColumns()
          }
        }
      },
      showContextMenu() {
        document.body.addEventListener('click', this.closeRowContextMenu)
      }
    },
    created() {
      // if (this.operationWidth === undefined) {
      //   this.operationWidth = '60px'
      // }
      this.tableListeners = {
        ...this.$listeners
      }
      if (this.name) {
        this._fetchColumns()
      } else {
        this.internalColumns = this.columns || []
        this.fetchData(undefined, this.isSearch)
      }
      if (this.contextMenu.length > 0 && this.contextMenu[this.contextMenu.length - 1].title !== '还原菜单') {
        this.contextMenu.push({ title: '还原菜单', icon: 'el-icon-refresh-left', clickEvent: this.revertMenu })
      }
    },
    mounted() {
    },
    updated() {
      this.$nextTick(this.calcHeight)
    },
    methods: {
      changeShow() {
        this.$emit('handleSearch', false)
      },
      watchKeyCode() {
        var _this = this;
        document.onkeydown = function(e) {
          let key = window.event.keyCode;
          if (key == 38) {
            _this.handleUpKeyCode()
          } else if (key == 40) {
            _this.handleDownKeyCodes()
          }
        }
      },
      handleUpKeyCode() {
        if (this.currentChangeRow.id !== undefined) {
          this.internalData.some((item,index) => {
            if (item.id === this.currentChangeRow.id) {
              if (index >= 1) {
                this.$refs.elTable.setCurrentRow(this.internalData[index - 1])
              }
            }
          })
        } else {
          this.$refs.elTable.setCurrentRow(this.internalData[0])
        }
      },
      handleDownKeyCodes() {
        if (this.currentChangeRow.id !== undefined) {
          let num = null
          this.internalData.some((item,index) => {
            if (this.currentChangeRow.id === item.id) {
              num = index + 1
            }
          })
          if (num < this.paginationQuery.pageSize) {
            this.$refs.elTable.setCurrentRow(this.internalData[num])
          }
        } else {
          this.$refs.elTable.setCurrentRow(this.internalData[0])
        }
      },
      calcHeight() {
        let height = this.height
        if (this.height && this.pageable) {
          const pagination = this.$refs.pagination
          if (pagination) {
            const paginationBounding = pagination.$el.getBoundingClientRect()
            height = `calc(${this.height} - ${paginationBounding.height + 4}px)`
          }
        }
        this.tableHeight = height
        // this.$nextTick(() => {
        //   this.$refs.elTable && this.$refs.elTable.doLayout()
        // })
      },
      async _fetchColumns() {
        try {
          const { code, data: columns } = await request.get(this.columnsUrl, {
            params: this.columnsFetcherParams
          })
          if (code === 200) {
            if (this.handleColumns) {
              this.internalColumns = this.handleColumns(columns, this.columnProp)
            } else {
              this.internalColumns = columns
            }
            console.log(this.internalColumns)
            this.fetchData(undefined, this.isSearch)
          }
        } catch (error) {
          console.error(error)
        }
      },
      async _handleHeaderDragend(newWidth, oldWidth, column) {
        this._updateColumnWidth(column.property, newWidth)
        await this._saveColumns(this.displayColumns)
        this.$emit('header-dragend', ...arguments)
      },
      _getColumnSortable(column) {
        const { sortable: sortableKey } = this.columnProp
        const sortable = column[sortableKey] || false
        if (sortable) {
          return this.isRemote ? 'custom' : !!sortable
        }
        return sortable
      },
      _getColumnFormatter(column) {
        const { formatter: formatterKey } = this.columnProp
        const formatter = column[formatterKey]
        let parent = this.$parent;
        while(parent) {
          if (parent[formatter]) {
            break;
          }
          parent = parent.$parent
        }
        if (parent && parent[formatter]) {
          return parent[formatter]
        }
        return undefined
      },
      _handleSortChange({ prop, order }) {
        const orderMap = {
          'ascending': 'ASC',
          'descending': 'DESC'
        }
        Object.assign(this.sortQuery, {
          order: orderMap[order] || '',
          sort: prop
        })
        this.$emit('sort-change', ...arguments)
      },
      _handleResetCurrentRow() {
        this.$refs.elTable && this.$refs.elTable.setCurrentRow(null)
      },
      async handleRowClick(row,column,cell,event){
        /* 单击时设置全部行为未编辑状态 */
        // for (const index in this.internalData) {
        //   this.$set(this.internalData[index], '_isEditing', false)
        // }
        await this.$emit('tableRowChange',row)
        if (this.clickStatus) {
          const selection = this.internalData
          for (const index in selection){
            const r = selection[index]
            r && this.$set(r, '_isEditing', false)
          }
          if (this.editable) {
            row && this.$set(row, '_isEditing', true)
          } else {
            row && this.$set(row, '_isEditing', false)
          }
        }
      },
      handleEditSelectionTree() {
        // console.log(this.internalData)
        // this.internalData.map(item => {
        //   this.$set(item, '_isEditing', false)
        //   if (item.children !== null) {
        //     item.children.map(items => {
        //       this.$set(items, '_isEditing', false)
        //     })
        //   }
        // })
        const selection = this.$refs.elTable.store.states.selection
        const obj = [ ...selection ]
        selection.map(item => {
          item && this.$set(item, '_isEditing', true)
        })

        //this.$refs.elTable.toggleRowSelection(selection)
      },
      handleEditSelection(){
        const selection = this.$refs.elTable.store.states.selection
        for (const index in selection){
          const row = selection[index]
          row && this.$set(row, '_isEditing', true)
        }
      },
      handleCancelEditSelection(){
        const selection = this.$refs.elTable.store.states.selection
        for (const index in selection){
          const row = selection[index]
          row && this.$set(row, '_isEditing', false)
        }
      },
      _handleTableCurrentChange(row, oldRow) {
        // if (this.editable) {
        //   row && this.$set(row, '_isEditing', true)
        //   oldRow && this.$set(oldRow, '_isEditing', false)
        // } else {
        //   row && this.$set(row, '_isEditing', false)
        //   oldRow && this.$set(oldRow, '_isEditing', false)
        // }
        /* 选中行时选中复选框,这里对原来的选中行有两种操作方法,一是直接清除全部选中,二是toggle原来的选中行 */
        this.currentChangeRow = row
        const selection = this.$refs.elTable.store.states.selection
        let c = 0
        for (const index in selection){
          const row = selection[index]
          if (row._isEditing) {
            c++
          }
        }
        // this.$refs.elTable.clearSelection()
        if (this.selectionState) {// 是否点击行进行勾选
          this.$refs.elTable.toggleRowSelection(row)
        }
        if (c === selection.length){

        } else {
          this.$refs.elTable.clearSelection()
          this.$refs.elTable.toggleRowSelection(row)
        }
        //this.$refs.elTable.toggleRowSelection(oldRow)

        this.$emit('table-current-change', ...arguments)
      },
      _handleRowContextMenu(row, column, event) {
        if (this.contextMenu.length !== 0) {
          event.preventDefault()
          const e = event || window.event
          this.menuStyles.top = (e.clientY - this.$el.getBoundingClientRect().top) + 'px'
          this.menuStyles.left = (e.clientX - this.$el.getBoundingClientRect().left) + 'px'
          this.showContextMenu = true
          this.currentLine = row
        }
      },
      handleDoubleClick(row, column, event) {
        if (this.doubleClickStatus) {
          const selection = this.internalData
          for (const index in selection){
            const r = selection[index]
            r && this.$set(r, '_isEditing', false)
          }
          if (this.editable) {
            row && this.$set(row, '_isEditing', true)
          } else {
            row && this.$set(row, '_isEditing', false)
          }
        }
      },
      closeRowContextMenu() {
        this.showContextMenu = false
      },
      _updateColumnWidth(prop, newWidth) {
        const {
          prop: propKey,
          width: widthKey
        } = this.columnProp || {}
        const foundDisplayColumn = this.displayColumns.find(displayColumn => {
          return displayColumn[propKey] === prop
        })
        if (foundDisplayColumn) {
          foundDisplayColumn[widthKey] = newWidth
        }
      },
      _getComponentName(config) {
        try {
          const o = config ? JSON.parse(config) : {}
          const { type } = o
          return this.cellRendererMap.getComponent(type)
        } catch (e) {
          console.log(e)
        }
      },
      _getColumnValue(column, prop) {
        const keys = prop.split('||')
        let ret
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          const value = get(column, key, '')
          ret = value
          if (!isUnset(ret)) {
            ret = value
          }
        }
        return ret
      },
      _getColumnKey(column, index) {
        const {
          prop: propKey,
          resizable: resizableKey
        } = this.columnProp
        const prop = column[propKey]
        const resizable = column[resizableKey]
        return `${prop}-${resizable}-${index}`
      },
      _openPropertiesDialog() {
        this.editingColumns = deepClone(this.internalColumns)
        this.propertiesDialogVisible = true
      },
      _handlePropertiesDialogClose() {
        this.editingColumns = []
      },
      _moveUp() {
        const {
          order: orderKey
        } = this.columnProp
        const prevRow = this.displayEditingColumns[this.currentPanelTableRowIndex - 1]
        const currentOrder = this.currentPanelTableRow[orderKey]
        const prevOrder = prevRow[orderKey]
        this.currentPanelTableRow[orderKey] = prevOrder
        prevRow[orderKey] = currentOrder
      },
      _moveDown() {
        const {
          order: orderKey
        } = this.columnProp
        const nextRow = this.displayEditingColumns[this.currentPanelTableRowIndex + 1]
        const currentOrder = this.currentPanelTableRow[orderKey]
        const nextOrder = nextRow[orderKey]
        this.currentPanelTableRow[orderKey] = nextOrder
        nextRow[orderKey] = currentOrder
      },
      /**
       * 列属性保存
       */
      async _saveColumns(columns) {
        const { code } = await request.post(this.columnsUpdateUrl, columns, {
          params: this.columnsUpdateParams
        })
        if (code === 200) {
          this.internalColumns = columns.slice(0)
          this.propertiesDialogVisible = false
          // this.$message.success('保存成功')
          return Promise.resolve()
        }
        return Promise.reject()
      },
      /**
       * 列属性时间修改
       */
      async _saveColumnsEdit() {
        const { code } = await request.post(this.columnsUpdateUrl, columns, {
          params: this.columnsUpdateParams
        })
        if (code === 200) {
          this.internalColumns = columns.slice(0)
          this.$message.success('保存成功')
          return Promise.resolve()
        }
        return Promise.reject()
      },
      // 点击恢复默认后需要刷新，重新获取列属性
      async _resetColumns() {
        const { code, data } = await request.get(this.columnsResetUrl + '/' + this.columnsResetParams.tableName)
        if (code === 200) {
          this.internalColumns = data.slice(0)
          this.propertiesDialogVisible = false
        }
      },
      _handlePanelTableCurrentChange(currentRow) {
        this.currentPanelTableRow = currentRow
      },
      _getPreset(column) {
        const { renderer: rendererKey } = this.columnProp
        const renderer = column[rendererKey]
        try {
          const o = JSON.parse(renderer)
          const presetName = o && o.options && o.options.preset
          const preset = this.presets[presetName] || {}
          return preset
        } catch (e) {
          return {}
        }
      },
      _traverseEditStatus(data) {
        if (Array.isArray(data)) {
          data.forEach(item => {
            const {
              _isEditing,
              children,
            } = item
            if (_isEditing === undefined) {
              this.$set(item, '_isEditing', false)
            }
            if (children) {
              this._traverseEditStatus(children)
            }
          })
        }
      },

      // Methods
      /**
       * 获取表格数据
       * @param {object} options 额外筛选参数
       */
      async fetchData(options, isSearch) {
        if (this.dataUrl !== '' && this.queryDataStatus) {
          try {
            this.dataFetchLoading = true
            this.isSearch = isSearch
            // console.log(isSearch)
            // if (isSearch === true) {
            //   this.isSearch = true
            // }
            // if (isSearch === false) {
            //   this.isSearch = false
            // }
            const url = this.isSearch === true ? (this.dataFilterUrl || this.dataUrl) : this.dataUrl
            console.log(`use url: ${url}`)
            const { code, data } = await request.get(url, {
              params: {
                ...this.dataFetcherParams,
                ...options
              }
            })
            if (code === 200) {
              if (this.pageable) {
                const {
                  currentPage,
                  pageSize,
                  rows,
                  total
                } = data || {}
                Object.assign(this.paginationQuery, {
                  currentPage,
                  pageSize
                })
                this.total = total
                this.internalData = rows || []
              } else {
                this.internalData = data || []
                this.total = this.internalData.length
              }
              this._traverseEditStatus(this.internalData)
              this.$emit('data-responsed', this.internalData)
              // this.watchKeyCode()
            }
          } catch (error) {
            console.error('error   ' + error)
            this.internalData = []
          } finally {
            this.dataFetchLoading = false
          }
        } else {
          return
        }
      },
      /**
       * 表首插入
       * @param {object} row
       */
      prepend(row) {
        row && this.internalData.unshift(row)
      },
      /**
       * 表尾插入
       * @param {object} row
       */
      append(row) {
        row && this.internalData.push(row)
      },
      /**
       * 按主键移除
       * @param {string} key
       */
      removeByKey(key) {
        if (!this.rowKey) {
          return Logger.warn({
            type: Logger.INVALID_PARAM,
            scope: 'CaTable.methods.removeByKey',
            message: '请提供行主键'
          })
        }
        const foundRowIndex = this.internalData.findIndex(row => row[this.rowKey] === key)
        ~foundRowIndex && this.internalData.splice(foundRowIndex, 1)
      },
      /**
       * 按主键替换
       * @param {string} key
       */
      replaceByKey(key, newRow) {
        if (!this.rowKey) {
          return Logger.warn({
            type: Logger.INVALID_PARAM,
            scope: 'CaTable.methods.replaceByKey',
            message: '请提供行主键'
          })
        }
        const foundRowIndex = this.internalData.findIndex(row => row[this.rowKey] === key)
        ~foundRowIndex && this.internalData.splice(foundRowIndex, 1, newRow)
      },
      /**
       * 刷新表格
       */
      refresh(...args) {
        return this.fetchData(...args)
      },
      /**
       * 获取当前表格数据
       */
      getTableData() {
        return this.internalData || []
      },
      /**
       * 清除编辑状态
       */
      clearEdit() {
        this._handleResetCurrentRow()
      },
      KeyUpEsc() {
        alert(2545)
      },
      revertMenu() {
        this.$confirm('是否还原为系统菜单,还原后若需要恢复需要清除浏览器缓存？')
          .then(_ => {
            console.log('确认要清除')
          })
          .catch(_ => {
          })
      },
      selectCellClickData(val,data) {
        let arr = []
        this.$refs.componentRefs.some((item,index) => {
          if (item.index === val && item.column.property === data.target) {
            arr.push(index)
          }
        })
        this.$refs.componentRefs[arr[0]].selectCellClicktest(data)
      },
      setOptionData(val, data) {
        let arr = []
        this.$refs.componentRefs.some((item,index) => {
          if (item.column.property === data.property) {
            this.$refs.componentRefs[index].options = val
          }
        })
      },
      handleCell(row,column,event,cell) {
        this.$emit('table-cell-change', row[column.property])
      },
      handleSizeChange() {
        this.$emit('page-changed', this.paginationQuery)
      },
      // 获取当前页
      handleCurrentChange() {
        this.$emit('page-changed', this.paginationQuery)
      },
      handleUnfoldRow(row) {
        this.expands = []
        this.expands = row
        console.log(row)
      },
      refreshTableSearch() {
        delete this.params.h
        this.fetchData(undefined, true)
      }
    }
  }

</script>

<style lang="scss">
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 9999999;
    position: fixed;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
    }
  }

  .contextmenu li:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  .c-ca-table {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;

    &__table {
      flex: 1;
      overflow-y: hidden;
    }

    &__pagination {
      margin-top: 12px;
      flex-shrink: 0;
    }

    &__edit-btn {
      position: absolute;
      right: 10px;
      top: 5px;
      z-index: 99;
    }

    &__panel {
      display: flex;

      & &__input-number {
        width: 100%;
      }

      &__operations {
        margin-left: 20px;
        display: flex;
        flex-direction: column;

        .el-button + .el-button {
          margin-top: 10px;
          margin-left: 0;
        }
      }
    }
  }

  .el-table__body tr,
  .el-table__body td {
    padding: 0;
    height: 10px;
  }

  .theme-17B882 .el-dialog__headerbtn .el-dialog__close {
    color: black;
  }

  .theme-17B882 .el-icon-close:before {
    font-size: 20px;
  }

  .queryShow {
    /deep/ {
      .el-button {
        max-width: 500px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  .theme-17B882 .el-date-editor.el-input, .theme-17B882 .el-date-editor.el-input__inner {
    width: 100%;
  }
</style>
