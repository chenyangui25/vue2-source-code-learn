// 唯一id
let id = 0

/**
 * @description 每个劫持的属性 new Dep
 */
class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }

  // 目的: 让Watcher中也存有dep
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null
let stack = []

export function pushTarget(watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep
