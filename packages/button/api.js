import http from './request.js'

const Api = {
    GET_TABLE_CONFIG: '/modelTableData/getTableDataByFmId'
}
// 获取表格配置
const getTableConfig = (baseUrl, params) => {
    return new Promise((resolve) => {
        http.post(baseUrl + Api.GET_TABLE_CONFIG, params).then(response => {
            resolve(response);
        })
    })
}

export {
    getTableConfig
}
