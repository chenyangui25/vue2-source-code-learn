import { nextTick } from '../utils'

/**
 * @description queue   存放watcher
 * @description has     存放那些watcher
 * @description pending 防抖
 */
let queue = []
let has = {}
let pending = false

/** 核心方法 */
/**
 * @description 执行watcher
 */
function flushSchedulerQueue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i].run()
  }

  queue = []
  has = {}
  pending = false
}

/**
 * @description 去除重复的watcher
 * @description 有多个watcher时 进行批处理(防抖)
 * @description 当前执行栈中代码执行完毕后，会先清空微任务，在清空宏任务 希望更早的渲染页面 nextTick
 */
export function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
      queue.push(watcher)
      has[id] = true
      if (!pending) {
        nextTick(flushSchedulerQueue)
        pending = true
      }

  }

}