import Table from './mhITable/index.js'
import EditDownTable from './EditDownTable/index.js'
import VXETable from 'vxe-table'
const install = app => {
    app.use(Table)
    app.use(EditDownTable)
}

const MhTable = { // 全局引用
    install
}


export { // 按需引入
    Table,
    EditDownTable,
}

export const VTable = VXETable

export default MhTable