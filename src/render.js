import { createElement, createTextElement } from './vdom/index'

export function renderMixin(Vue) {
  /** 标签 */
  Vue.prototype._c = function() {
    return createElement(this, ...arguments)
  }

  /** 文本 */
  Vue.prototype._v = function(text) {
    return createTextElement(this, text)
  }

  /** 要获取的变量的值 如果是对象 */
  Vue.prototype._s = function(val) {
    if(typeof val == 'object') return JSON.stringify(val)
    return val
  }

  /** 调用render函数 */
  Vue.prototype._render = function() {
    const vm = this
    let render = vm.$options.render
    let vnode = render.call(vm)
    return vnode
  }
}
