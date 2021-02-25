import { patch } from './vdom/patch'
import { nextTick } from './utils'
import Watcher from './observer/watcher'

/** 生命周期 */
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function(vnode) {
    const vm = this

    // 表示将当前的虚拟节点保存起来
    const prevVnode = vm._vnode

    if (!prevVnode) {
      // 初次渲染
      vm.$el = patch(vm.$el, vnode)
    } else {
      vm.$el = patch(prevVnode,vnode)
    }

    vm._vnode = vnode

  }

  Vue.prototype.$nextTick = nextTick

}

export function mountComponent(vm, el) {

  // 更新函数 数据变化后 会再次调用此函数
  let updateComponent = () => {
    vm._update(vm._render())
  }

  callHook(vm,'beforeMount')
  new Watcher(vm, updateComponent, () => {
    console.log('视图更新了')
  }, true)
  callHook(vm,'mounted')

}

/**
 * @description 处理 hook 函数
 */
export function callHook(vm, hook) {
  let handlers = vm.$options[hook]
  if (handlers) {
      for (let i = 0; i < handlers.length; i++) {
          handlers[i].call(vm)
      }
  }
}
