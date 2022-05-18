import axios from "axios";
import { Message } from 'element-ui'
var Axios = axios.create();
// 请求拦截
Axios.interceptors.request.use(
  (config) => {
    // token认证写在这里
    return config;
  },
  (err) => {
    Promise.reject(err);
  }
);
// 响应拦截
Axios.interceptors.response.use(
  (config) => {
    return config;
  },
  (err) => {
    Promise.reject(err);
  }
);
// get封装
export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    Axios({
      url,
      params,
      method: "get",
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
export function post(url, data = {}) {
  return new Promise((resolve) => {
    Axios({
      url,
      data,
      method: "post",
    })
      .then((res) => {
        if (res.data.code === 200) {
          resolve(res.data);
        } else {
          handleError(res.data && res.data.message || '请输入正确的数据')
        }
      })
      .catch(() => {
        handleError()
      });
  });
}
function handleError (msg) {
  Message.error(msg)
}
export default {
    get,
    post
}
