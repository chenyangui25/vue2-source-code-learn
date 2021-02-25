export function isFunction(data) {
  return typeof data === 'function'
}

export function isObject(data) {
  return typeof data === 'object' && data !== null
}

/**
 * @description 是否是原生标签
 */
export function isReservedTag(str) {
  let reservedTag = 'a,div,span,ul,li,p,img,button'
  return reservedTag.includes(str)
}

/** nextTick module */
/**
 * @description callbacks   队列要执行的异步函数
 * @description waiting     防抖
 */
let callbacks = []
let waiting = false

/**
 * @description 执行回调函数
 */
function flushCallbacks() {
  callbacks.forEach(cb => cb())
  waiting = false
  callbacks = []
}

/**
 * @description 异步函数的降级处理(兼容适配)
 */
function timer(flushCallbacks) {
  let timerFn = () => {}
  if (Promise) {
    timerFn = () => { Promise.resolve().then(flushCallbacks) }
  } else if (MutationObserver) {
    let textNode = document.createTextNode(1)
    let observe = new MutationObserver(flushCallbacks)
    observe.observe(textNode, { characterData: true })
    timerFn = () => { textNode.textContent = 3 }
  } else if (setImmediate) {
    timerFn = () => { setImmediate(flushCallbacks) }
  } else {
    timerFn = () => { setTimeout(flushCallbacks) }
  }

  timerFn()
}

export function nextTick(cb) {
  callbacks.push(cb)

  if (!waiting) {
    timer(flushCallbacks)
    waiting = true
  }
}

/** mergeOptions module */

/**
 * @description 存放各种策略
 */
let strats = {}

// 生命周期
let lifeCycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
]

/**
 * @description 生命周期 hook方法
 */
function mergeHook(parentVal, childVal) {
  if (childVal) {
      if (parentVal) {
          return parentVal.concat(childVal)
      } else {
          return [childVal]
      }
  } else {
      return parentVal
  }
}

lifeCycleHooks.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * @description Vue.componet 组件的hook函数
 */
strats.components = function(parentVal, childVal) {
  let options = Object.create(parentVal)
  if (childVal) {
      for (let key in childVal) {
          options[key] = childVal[key]
      }
  }
  return options

}

/**
 * @description 合并
 * @description 如 使用 Vue.mixin时 合并到全局的 Vue.options中
 * @description 如 创建组件时 传入组件的options 和 全局的Vue.options 合并
 * @param {Object} parent 
 * @param {Object} child  传入的选项
 */
export function mergeOptions(parent, child) {
  const options = {}

  for (let key in parent) {
    mergeField(key)
  }

  for (let key in child) {
    if (parent.hasOwnProperty(key)) {
      continue
    }

    mergeField(key)
  }

  function mergeField(key) {
    let parentVal = parent[key]
    let childVal = child[key]

    if (strats[key]) {
      options[key] = strats[key](parentVal, childVal)
    } else {
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal }
      } else {
          options[key] = parentVal || childVal
      }
    }

  }

  return options

}