import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this

    vm.$options = mergeOptions(vm.constructor.options, options)

    callHook(vm, 'beforeCreate')

    /** observer data computed watch... */
    initState(vm)

    callHook(vm, 'created')

    /** compiler */
    if (vm.$options.el) { vm.$mount(vm.$options.el) }

  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options

    el = document.querySelector(el)
    vm.$el = el

    if (!options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      
      let render = compileToFunction(template)
      options.render = render
    }

    /** 组件挂载 */
    mountComponent(vm, el)
  }
  
}