import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'
import { stateMixin } from './state'
import { initGlobalApi } from './global-api/index'

function Vue (options) {
  /** 初始化 */
  this._init(options)
}

/**
 * @description 扩展原型Vue.prototype
 */
initMixin(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
stateMixin(Vue)

/**
 * @description 扩展类全局 Vue.APi
 */
initGlobalApi(Vue)

export default Vue
