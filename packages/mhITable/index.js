import Table from './index.vue'


Table.install = app => {
    app.component(Table.name, Table)
}

export default Table