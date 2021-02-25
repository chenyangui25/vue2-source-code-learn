import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './scheduler'

// 给每一个创建Watcher 唯一id
let id = 0

/**
 * @description 数据劫持时 期望一个属性对应多个watcher 同时一个watcher对应多个属性
 */
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.id = id++

    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options


    this.deps = []
    this.depsId = new Set()

    /** computed watcher */
    this.lazy = !!options.lazy
    this.dirty = options.lazy

    /** 用户watcher */
    /** 并将用户watcher传进来的exprOrFn(key) 进行函数封装 */
    this.user = !!options.user
    if (typeof exprOrFn == 'string') {
      this.getter = function() {
          // vm取值 'obj.n' -> ['obj', 'n'] -> vm['obj']['n']
          let path = exprOrFn.split('.')
          let obj = vm
          for (let i = 0; i < path.length; i++) {
              obj = obj[path[i]]
          }
          return obj
      }
    } else {

      /** 组件的更新函数 */
      this.getter = exprOrFn
    }

    /** 用户 watcher 默认取得第一次值 */
    /** computed watcher 默认不执行  */
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    pushTarget(this)
    const value = this.getter.call(this.vm)
    popTarget()

    return value
  }

  update() {
    if (this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  run() {
    /** 考虑1 渲染组件watcher */
    /** 考虑2 用户watcher(newValue oldValue) */
    let newValue = this.get()
    let oldValue = this.value
    this.value = newValue

    /** 用户watcher */
    if (this.user) {
        this.cb.call(this.vm, newValue, oldValue)
    }
  }

  /**
   * @desc render -> vnode 时 多次调用劫持属性 去重
   * @desc Watcher存储dep 并调用dep中的方法去存储watcher
   */
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  /** computed watcher */
  evaluate() {
    this.dirty = false
    this.value = this.get()
  }

  depend() {
    let i = this.deps.length
    while(i--) {
      this.deps[i].depend()
    }
  }

}

export default Watcher
