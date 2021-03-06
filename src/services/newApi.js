import $request from 'superagent';
import { getLanguage } from 'util/storage.util';
import MsgBox from 'components/MsgBox';

/**
 * 网络请求方法
 * url：请求地址
 * options = {
*   catchs: 异常处理，控制台抛出的异常是否自己处理：true 是，false 否 由公共方法统一处理优化显示给用户 默认 false
*   method: 请求使用的方法，如 GET、POST
*   headers: 请求的头信息，形式为 Headers 对象或 ByteString。
*   body: 请求的 body 信息：可能是一个 Blob、BufferSource、FormData、URLSearchParams 或者 USVString 对象。注意 GET 或 HEAD 方法的请求不能包含 body 信息。
*   mode: 请求的模式，如 cors、no-cors 或者same-origin。是否允许跨域请求
*   cache:  请求的 cache 模式: default, no-store, reload, no-cache, force-cache, or only-if-cached.
* }
 */

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-cache'
};
/**
 * 默认请求携带url中的参数
 * */
const QUERY_PARAMS = {
  'type':'MOBILE',
  'APPTYPE': 'touch',
  'chanel': 'touch',
  'lang': getLanguage() || 'zh'
};

/**
 * 请求loading效果
 * */
let defaultSetting = {
  loadingStart: true,
  loadingEnd: true,
};

/**
 * 处理url参数
 *
 * @return 返回拼接后的url
 * */
export const _dealParams = (queryParams) => {
  return "?" + Object.keys(queryParams).map((i) => {
    return (i+"="+queryParams[i])
  }).join("&")
};

/**
 * post请求
 *
 * @return 请求结果
 * */
export const callApiPost = (options) => {
  beforeRequest(options);
  let defaultConfig = {
    method: 'POST',
    headers: HEADERS,
    queryParams: QUERY_PARAMS,
    querys: {},
    body: {}
  };

  defaultConfig = Object.assign({}, defaultConfig, options);
  defaultConfig.body = JSON.stringify(defaultConfig.body);

  console.log("请求前参数url", options.url);
  console.log("请求前参数", defaultConfig);

  $request
    .post(options.url)
    .query(defaultConfig.queryParams)
    .send(options.querys)
    .set(defaultConfig.headers)
    .end((err, res) => {
      checkResponse(err, res, defaultConfig)
      afterRequest(options)
    });
};

/**
 * 请求回调
 */
export const checkResponse = (err, res, defaultConfig) => {
  if (err) {
    let msg = {}
    if (res.status === '504') {
      msg = {
        'MESSAGE': '您的网络好像不给力哦~'
      }
    } else {
      msg = {
        'MESSAGE': '服务器繁忙，请您稍后再试'
      }
    }
    defaultConfig.error ? defaultConfig.error(msg) : null
    defaultConfig.complete ? defaultConfig.complete(msg) : null
  } else {
    let result = ''
    try {
      result = _returnContentByType(res)
    } catch (e) {
      let msg = {
        'MESSAGE': '您的网络好像不给力哦~'
      }
      defaultConfig.error ? defaultConfig.error(msg) : null
      defaultConfig.complete ? defaultConfig.complete(msg) : null
      return msg;
    }
    defaultConfig.success ? defaultConfig.success(result) : null
    defaultConfig.complete ? defaultConfig.complete(result) : null
  }
}

/**
 * get请求
 *
 * @return 请求结果
 * */
export const callApi = (options) => {
  beforeRequest(options);
  let defaultConfig = {
    credentials: 'include',
    method: 'GET',
    headers: HEADERS,
    queryParams: QUERY_PARAMS,
    querys: {},
    body: {}
  };

  defaultConfig = Object.assign({}, defaultConfig, options);
  defaultConfig.body = JSON.stringify(defaultConfig.body);

  console.log("请求前参数url", options.url);
  console.log("请求前参数", defaultConfig);

  $request
    .get(options.url)
    .query(Object.assign({}, defaultConfig.queryParams, options.querys))
    .set(defaultConfig.headers)
    .end((err, res) => {
      checkResponse(err, res, defaultConfig)
      afterRequest(options)
    })
};

/**
 * 根据type返回不同格式的response
 */
export const _returnContentByType = (response) => {

  let type = response.headers['Content-Type'.toLowerCase()].split(";")[0];
  switch (type) {
    case 'text/plain':
      console.warn("请求text/plain结果", response);
      return JSON.parse(response.text);
      break;
    case 'text/html':
      console.warn("请求text/html结果", response);
      return response.json();
      break;
    case 'application/json':
      console.log("请求成功结果", response);
      return JSON.parse(response.text);
      break;
    default:
  }
};

/**
 * 请求前处理
 * */
export const beforeRequest = (setting) => {
  defaultSetting = Object.assign({}, defaultSetting, setting);
  if(defaultSetting.loadingStart) {
    MsgBox.toastTips({type: 'loading'})
  }
};

/**
 * 请求后处理
 * */
export const afterRequest = (setting) => {
  defaultSetting = Object.assign({}, defaultSetting, setting);
  if(defaultSetting.loadingEnd) {
    MsgBox.hide()
  }
};

