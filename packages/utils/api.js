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
  GET_TREE: '/api/core/fn/modelTreeData/getTreeDataByFmId',
  GET_DYNAMIC_QUERY_FORM: '/api/core/fn/hepCoreFmQForm/getTableQueryFormList',
  GET_CREATE_FORM: '/api/core/fn/modelData/getFormList',
  CREATE_TABLE_DATA: '/api/core/fn/modelData/createData',
  CREATE_TREE_DATA: '/api/core/fn/modelTreeData/createData',
  UPDATE_TREE_DATA: '/api/core/fn/modelTreeData/updateData',
  DELETE_TREE_DATA: '/api/core/fn/modelTreeData/deleteData',
  GET_MENU_TREE: '/api/core/fn/modeResData/getFnResTree',
  GET_LAYOUT_INFO: '/api/core/fn/modeResData/getOperateLayout',
  GET_ALT_QUERY_PLAN: '/api/core/fn/hepCoreFmQForm/getTableAlternativeQueryFormList',
  CREATE_QUERY_PLAN: '/api/core/fn/hepCoreFmQForm/createTableAlternativeQueryForm',
  UPDATE_QUERY_PLAN: '/api/core/fn/hepCoreFmQForm/updateTableAlternativeQueryForm',
  DEL_QUERY_PLAN: '/api/core/fn/hepCoreFmQForm/deleteTableAlternativeQueryForm',
  GET_QUERY_PLAN_DETAIL: '/api/core/fn/hepCoreFmQForm/getTableAlternativeQueryFormById',
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

// 动态查询表单
const getDynamicQueryForm = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_DYNAMIC_QUERY_FORM, params);
};

// 动态查询表单
const getCreateForm = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_CREATE_FORM, params);
};

// 新增表格数据
const createTableData = (baseUrl, params) => {
  return http.post(baseUrl + Api.CREATE_TABLE_DATA, params);
};

// 新增树数据
const createTreeData = (baseUrl, params) => {
  return http.post(baseUrl + Api.CREATE_TREE_DATA, params);
};

// 修改树数据
const updateTreeData = (baseUrl, params) => {
  return http.post(baseUrl + Api.UPDATE_TREE_DATA, params);
};

// 删除树数据
const deleteTreeData = (baseUrl, params) => {
  return http.post(baseUrl + Api.DELETE_TREE_DATA, params);
};

// 获取菜单数据
const getMenuTree = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_MENU_TREE, params);
};

// 获取布局数据
const getLayoutInfo = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_LAYOUT_INFO, params);
};

// 获取布局数据
const getAltQueryPlan = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_ALT_QUERY_PLAN, params);
};

// 新增查询方案
const createQueryPlan = (baseUrl, params) => {
  return http.post(baseUrl + Api.CREATE_QUERY_PLAN, params);
};

// 修改查询方案
const updateQueryPlan = (baseUrl, params) => {
  return http.post(baseUrl + Api.UPDATE_QUERY_PLAN, params);
};

// 删除查询方案
const deleteQueryPlan = (baseUrl, params) => {
  return http.get(baseUrl + Api.DEL_QUERY_PLAN, params);
};

// 获取查询方案详情
const getQueryPlanDetail = (baseUrl, params) => {
  return http.get(baseUrl + Api.GET_QUERY_PLAN_DETAIL, params);
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
  getTree,
  getDynamicQueryForm,
  getCreateForm,
  createTableData,
  createTreeData,
  updateTreeData,
  deleteTreeData,
  getLayoutInfo,
  getMenuTree,
  getAltQueryPlan,
  createQueryPlan,
  updateQueryPlan,
  deleteQueryPlan,
  getQueryPlanDetail
};
