import axios from 'axios';

const http = axios.create({
  baseURL: '/',
  timeout: 6000,
  headers: {  }
})

http.interceptors.request.use(config => {

  return config
},
error => {
    return Promise.reject('请求错误774')
})

http.interceptors.response.use(response => {

  return response.data || response
},
error => {
    return Promise.reject(error)
})

const httpRequest = {
  get: (url, params = {}, headers = {}) => {
    return http.get(url,{ params, headers })
  },
  post: (url, params, headers = {}) => {
    return http.post(url, params,{ headers })
  }
}

export default httpRequest;
