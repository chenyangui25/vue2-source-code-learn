const oldArrayPrototype = Array.prototype

export let arrayMethods = Object.create(oldArrayPrototype)

/**
 * @description 改变原数组的七个方法
 */
const methods = [
  'push',
  'pop',
  'unshift',
  'shift',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    oldArrayPrototype[method].call(this, ...args)

    let ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }

    if (inserted) ob.observeArray(inserted)

    ob.dep.notify()

  }
})
