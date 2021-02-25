import { isObject, isReservedTag } from '../utils'

/**
 * @description 创建文本的vnode
 */
export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

/**
 * @description 创建标签的vnode
 */
export function createElement(vm, tag, data = {}, ...children) {
  // tag 是不是原生标签
  if (isReservedTag(tag)) {
    return vnode(vm, tag, data, data.key, children, undefined)
  } else {
    const Ctor = vm.$options.components[tag]
    return createComponent(vm, tag, data, data.key, children, Ctor)
  }

}

/**
* @description 创建组件的vnode
*/
function createComponent(vm, tag, data, key, children, Ctor) {
  // 组件是不是构造函数
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor)
  }

  data.hook = {
    init(vnode) {
      let vm = vnode.componentInstance = new Ctor({_isComponent: true})
      vm.$mount()
    }
  }

  return vnode(vm, `vue-component-${tag}`, data, key, undefined, undefined, {Ctor, children})
}

/** 核心方法 */
/**
 * @description 套装vnode
 */
function vnode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions
    // .....
  }
}