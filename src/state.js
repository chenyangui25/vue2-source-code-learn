import { isFunction } from './utils'
import { observe, set, del } from './observer/index'
import Watcher from './observer/watcher'
import Dep from "./observer/dep"

export function initState(vm) {
  const opts = vm.$options
  
  // data
  if (opts.data) { initData(vm) }

  // computed
  if (opts.computed) { initComputed(vm, opts.computed) }

  // watch
  if (opts.watch) { initWatch(vm, opts.watch) }

}

export function stateMixin(Vue) {
  /**
   * @description 用户创建的watch
   */
  Vue.prototype.$watch = function(key, handler, options={}) {
    options.user = true
    new Watcher(this, key, handler, options)
  }

  /**
   * @description $set $del
   */
  Vue.prototype.$set = set
  Vue.prototype.$del = del
}

/**
 * @description proxy
 */
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

/**
 * @description data 劫持数据
 */
function initData(vm) {
  let data = vm.$options.data

  data = vm._data = isFunction(data) ? data.call(vm) : data

  /** 代理数据到实例上 */
  for (const key in data) {
    proxy(vm, '_data', key)
  }

  /** 数据劫持 */
  observe(data)
}

/** initWatche module */
/**
 * @description 调用$watch
 */
function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler)
}

/**
* @description 初始化 watch 将观察属性的function拆分出来
* @description 每个观察属性 创建new watcher
*/
function initWatch(vm, watch) {
  for (const key in watch) {
      const handler = watch[key]
      if (Array.isArray(handler)) {
          for (let i = 0; i < handler.length; i++) {
              createWatcher(vm, key, handler[i])
          }
      } else {
          createWatcher(vm, key, handler)
      }
  }
}

/** initComputed module */
/**
 * @description 通过computed watcher 里的dirty 判断是不是脏(true) 来取值 从而达到缓存(多次取值只执行一次 dirty = false) 如果依赖值发生变化 dirty = true
 * @description 并将所有依赖的watcher 通过watcher中的deps push去 
 */
function createComputedGetter(key) {
  return function computedGetter() {
      // 取值时 this -> vm
      let watcher = this._computedWactchers[key]

      // 根据 dirty 判断是否重新求值 实现缓存
      if (watcher.dirty) {
          watcher.evaluate()
      }

      if (Dep.target) {
          watcher.depend()
      }

      return watcher.value
  }
}

/**
* @description 将computed上的属性 定义在vm Object.defineProperty -> getter
* @description computed属性 没有Dep
*/
function defineComputed(vm, key, userDef) {
  let sharedProperty = {}
  if (typeof userDef == 'function') {
      sharedProperty.get = createComputedGetter(key)
  } else {
      sharedProperty.get = createComputedGetter(key)
      sharedProperty.set = userDef.set
  }
  Object.defineProperty(vm, key, sharedProperty)
}

/**
* @description 初始化computed 并创建watcher
*/
function initComputed(vm, computed) {
  const watchers = vm._computedWactchers = {}
  for (const key in computed) {
      const userDef = computed[key]
      let getter = typeof userDef == 'function' ? userDef : userDef.get

      watchers[key] = new Watcher(vm, getter, ()=>{}, { lazy: true })

      // 将key 定义在vm上
      defineComputed(vm, key, userDef)
  }

}
