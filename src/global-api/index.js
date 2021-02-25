import { mergeOptions } from "../utils"

/**
 * @description Vue api
 */
export function initGlobalApi(Vue) {
  /** 存放全局的配置 每个组件初始化的时候 都要与其合并 */
  Vue.options = {}

  /** 子类可以通过_base, 找到Vue */
  Vue.options._base = Vue

  /** mixin */
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    return this
  }

  /** component */
  Vue.options.components = {}
  Vue.component = function (id, definition) {
    definition = this.options._base.extend(definition)
    this.options.components[id] = definition
  }

  /** 给个对象 返回继承Vue的类 */
  Vue.extend = function(opts) {
    const Super = this

    const Sub = function VueComponent(options) {
      this._init(options)
    }

    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub

    // 只与Vue.options 合并
    Sub.options = mergeOptions(Super.options, opts)

    return Sub
  }

}