import { isObject } from '../utils'
import { arrayMethods } from './array'
import Dep from './dep'

class Observer {
  constructor(data) {
    this.dep = new Dep()

    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    })

    /** 数据是数组 */
    if(Array.isArray(data)) {
      data.__proto__ = arrayMethods
      this.observeArray(data)
      return
    }
  
    /** 数据是对象 */
    this.walk(data)
    
  }

  /**
   * @desc 对象时
   */
  walk(data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  
  /**
   * @desc 数组时
   */
  observeArray(data) {
    data.forEach(item => observe(item))
  }

}

/**
 * @description 多层数组 依赖收集 watcher
 */
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
      let current = value[i]
      current.__ob__ && current.__ob__.dep.depend()
      if (Array.isArray(current)) {
          dependArray(current)
      }
  }
}

/** 核心方法 */
/**
 * @description 劫持对象数据
 */
function defineReactive(data, key, value) {
  let childOb = observe(value)

  let dep = new Dep()

  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.depend()

        // 数组和对象进行依赖收集watcher
        if (childOb) {
          childOb.dep.depend()

          // 多层数组[[[]]] 
          if (Array.isArray(value)) { dependArray(value) }
        }
      }

      return value
    },

    set(newValue) {
      if (newValue !== value) {
        observe(newValue)
        value = newValue
        dep.notify()
      }
    }

  })
}

export function observe(data) {
  if (!isObject(data)) return
  
  if (data.__ob__) return data.__ob__

  return new Observer(data)
}

/** 辅助函数 set del module */
/**
 * @description set
 */
export function set(target, key, value) {
  // 数组采用splice方法
  if (Array.isArray(target)) {
      target.length = Math.max(target.length, key)
      target.splice(key, 1, value)
      return value
  }

  // 如果对象本身上已有 返回
  if (target.hasOwnProperty(key)) {
      target[key] = value
      return value
  }

  const ob = target.__ob__

  // 如果数据没有劫持 就是个普通对象 直接赋值 返回
  if (!ob) {
      target[key] = value
      return value
  }

  // 数据进行劫持
  defineReactive(ob.value, key, value)

  // 发布
  ob.dep.notify()
  return value
}

/**
* @description del
*/
export function del (target, key) {
  if (Array.isArray(target)) {
      target.splice(key, 1)
      return
  }

  const ob = target.__ob__

  if (!target.hasOwnProperty(key)) return

  delete target[key]

  if (!ob) return

  ob.dep.notify()
} 
