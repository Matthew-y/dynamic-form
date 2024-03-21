import http from "./request.js";

const Api = {
  GET_TABLE_CONFIG: "/api/core/fn/modelTableData/getTableDataByFmId",
  GET_PAGE_LIST: '/api/core/fn/modelData/getPageList',
  GET_DATA_ITEM: '/api/core/fn/modelData/getDataById',
  UPDATE_COLUMN: '/hpCoreTableColumn/update',
  UPDATE_COLUMNS: '/hpCoreTableColumn/updateBatch',
  DELETE_DATA: '/api/core/fn/modelData/deleteData',
  GET_QUERY_DATA: '/api/core/fn/modelData/getTableColDataSelectTableListData',
  UPDATE_ROW: '/api/core/fn/modelData/updateData',
  GET_TREE: '/api/core/fn/modelTreeData/getTreeDataByFmId'
};
// 获取表格配置
const getTableConfig = (baseUrl, params) => {
  return http.post(baseUrl + Api.GET_TABLE_CONFIG, params, {
    token: 'fakeToken'
  });
};

// 删除用户数据
const deleteData = (baseUrl, params) => {
  return http.post(baseUrl + Api.DELETE_DATA, params, {
    token: 'fakeToken'
  });
};

// 获取分页数据
const getPageList = (baseUrl, params) => {
  return http.post(baseUrl + Api.GET_PAGE_LIST, params);
};

// 获取单个用户数据
const getData = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_DATA_ITEM, params);
};

// 更新列数据
const updateColumn = (baseUrl, params) => {
  return http.post(baseUrl + Api.UPDATE_COLUMN, params);
};

// 更新列数据
const updateColumns = (baseUrl, params) => {
  return http.post(baseUrl + Api.UPDATE_COLUMNS, params);
};

// 获取查询弹框数据
const getQueryData = (baseUrl, params) => {
  return http.post(baseUrl + Api.GET_QUERY_DATA, params);
};

// 更新单行数据
const updateRow = (baseUrl, params) => {
  return http.post(baseUrl + Api.UPDATE_ROW, params);
};

// 更新单行数据
const getTree = (baseUrl, params) => {
  return http.post(baseUrl + Api.GET_TREE, params);
};

export {
  getTableConfig,
  deleteData,
  getPageList,
  getData,
  updateColumn,
  updateColumns,
  getQueryData,
  updateRow,
  getTree
};
